import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tlpwjfzkvbafpvoowakq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscHdqZnprdmJhZnB2b293YWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNzU4OTUsImV4cCI6MjA0OTc1MTg5NX0.aRDbF8UVRVli_uLQXlc0nS9FgLyvretqw1xu8YAjHGo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type BookingType = 'morning' | 'evening' | 'full';

export type Booking = {
  id: number;
  client_name: string;
  date: string;
  booking_type: BookingType;
  price: number;
  notes?: string;
  created_at: string;
};

export const db = {
  bookings: {
    // جلب كل الحجوزات
    async getAll() {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },

    // جلب حجوزات شهر معين
    async getByMonth(year: number, month: number) {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },

    // جلب حجوزات يوم معين
    async getByDate(date: string) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', date)
        .order('booking_type', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },

    // إنشاء حجز جديد
    async create(booking: Omit<Booking, 'id' | 'created_at'>) {
      // التحقق من توفر الموعد
      const isAvailable = await this.checkAvailability(
        booking.date,
        booking.booking_type
      );

      if (!isAvailable) {
        throw new Error('الموعد غير متاح');
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // حذف حجز
    async delete(id: number) {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    // التحقق من توفر موعد
    async checkAvailability(date: string, type: BookingType) {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_type')
        .eq('date', date);

      if (error) throw error;

      if (data.length === 0) return true;
      
      // إذا كان الحجز ليوم كامل أو يوجد حجز ليوم كامل
      if (type === 'full' || data.some(b => b.booking_type === 'full')) 
        return false;
      
      // التحقق من تعارض الفترة
      return !data.some(b => b.booking_type === type);
    },

    // إحصائيات الحجوزات
    async getStats(year: number, month: number) {
      const bookings = await this.getByMonth(year, month);
      
      const totalIncome = bookings.reduce((sum, b) => sum + b.price, 0);
      const totalBookings = bookings.length;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      const totalSlots = daysInMonth * 2; // صباحي ومسائي
      
      const occupiedSlots = bookings.reduce((sum, b) => 
        sum + (b.booking_type === 'full' ? 2 : 1), 0
      );
      
      const occupancyRate = (occupiedSlots / totalSlots) * 100;

      return {
        totalIncome,
        totalBookings,
        occupancyRate,
        occupiedSlots,
        totalSlots
      };
    }
  }
};

// Helper Functions
export async function isSlotAvailable(date: string, type: BookingType) {
  return db.bookings.checkAvailability(date, type);
}

export function formatPrice(price: number): string {
  return price.toFixed(3) + ' د.ك';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-KW', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
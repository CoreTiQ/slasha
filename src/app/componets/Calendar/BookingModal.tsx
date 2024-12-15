'use client';

import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, type BookingType } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface BookingModalProps {
  date: string;
  onClose: () => void;
}

interface BookingForm {
  client_name: string;
  booking_type: BookingType;
  price: string;
  notes: string;
}

export default function BookingModal({ date, onClose }: BookingModalProps) {
  const [form, setForm] = useState<BookingForm>({
    client_name: '',
    booking_type: 'morning',
    price: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { mutate: createBooking, isLoading } = useMutation({
    mutationFn: async () => {
      // التحقق من توفر الموعد قبل الإنشاء
      const isAvailable = await db.bookings.checkAvailability(date, form.booking_type);
      
      if (!isAvailable) {
        throw new Error('هذا الموعد غير متاح');
      }

      return db.bookings.create({
        client_name: form.client_name,
        date,
        booking_type: form.booking_type,
        price: Number(form.price),
        notes: form.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم إضافة الحجز بنجاح');
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الحجز');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة المدخلات
    if (!form.client_name.trim()) {
      toast.error('الرجاء إدخال اسم العميل');
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error('الرجاء إدخال سعر صحيح');
      return;
    }

    createBooking();
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6">
          <Dialog.Title className="text-xl font-bold text-center mb-6">
            إضافة حجز جديد - {new Date(date).toLocaleDateString('ar-KW', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-white/80 mb-1">
                اسم العميل
              </label>
              <Input
                type="text"
                value={form.client_name}
                onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="أدخل اسم العميل"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-white/80 mb-1">
                نوع الحجز
              </label>
              <Select
                value={form.booking_type}
                onChange={e => setForm(f => ({ ...f, booking_type: e.target.value as BookingType }))}
                disabled={isLoading}
                options={[
                  { value: 'morning', label: 'صباحي' },
                  { value: 'evening', label: 'مسائي' },
                  { value: 'full', label: 'يوم كامل' }
                ]}
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-white/80 mb-1">
                السعر (د.ك)
              </label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.000"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-white/80 mb-1">
                ملاحظات
              </label>
              <Input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أضف أي ملاحظات إضافية"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ الحجز'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
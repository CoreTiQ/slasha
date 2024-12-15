interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, trend }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="flex justify-between items-start">
        <div>
          <p className="stats-title">{title}</p>
          <h3 className="stats-value">{value}</h3>
        </div>
      </div>

      {trend && (
        <div className={`stats-comparison ${trend.isPositive ? 'stats-trend-up' : 'stats-trend-down'}`}>
          <span>
            {trend.value}% مقارنة بالشهر السابق
          </span>
        </div>
      )}
    </div>
  );
}
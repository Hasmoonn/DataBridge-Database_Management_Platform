import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#14213d] border border-[#fca311]/30 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#e5e5e5]/60 mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#fca311]">
          {payload[0]?.value?.toLocaleString()} rows
        </p>
      </div>
    );
  }
  return null;
};

const ActivityChart = ({ activityData = [], loading = false }) => {
  const chartData = useMemo(() => {
    if (activityData.length > 0) {
      return activityData.map((entry) => {
        const date = new Date(`${entry.date}T12:00:00`);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          rows: entry.rows ?? 0,
          date: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        };
      });
    }

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        rows: 0,
        date: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    return days;
  }, [activityData]);

  if (loading) {
    return (
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
        <div className="h-4 w-48 bg-white/6 rounded animate-pulse mb-6" />
        <div className="h-48 bg-white/3 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <h3 className="text-sm font-semibold text-white">
          Transfer Activity — Last 7 Days
        </h3>
        <span className="text-xs text-[#e5e5e5]/50">Rows transferred</span>
      </div>
      <div className="h-44 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fca311" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fca311" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(229,229,229,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(229,229,229,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="rows"
              stroke="#fca311"
              strokeWidth={2}
              fill="url(#goldGradient)"
              dot={{ fill: '#fca311', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#fca311' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
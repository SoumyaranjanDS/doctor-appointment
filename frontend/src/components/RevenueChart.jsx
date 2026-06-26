import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data, title = "Revenue Over Time" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm h-[300px] flex items-center justify-center">
        <p className="text-on-surface-variant font-medium">No data available for chart</p>
      </div>
    );
  }

  const formatYAxis = (tickItem) => {
    return `₹${tickItem}`;
  };

  return (
    <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-6">{title}</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B4232" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0B4232" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
            <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#0B4232', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="amount" stroke="#0B4232" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;

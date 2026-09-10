import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SubjectData {
  name: string;
  acertos: number;
  erros: number;
  nãoResolvidos: number;
}

interface SubjectChartProps {
  data: SubjectData[];
}

export const SubjectChart: React.FC<SubjectChartProps> = ({ data }) => {
  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#a855f720" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#a855f780' }}
            interval={0}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#a855f780' }}
          />
          <Tooltip 
            cursor={{ fill: '#01142e80' }}
            contentStyle={{ 
              backgroundColor: '#0a2346', 
              borderRadius: '12px', 
              border: '1px solid rgba(84, 172, 191, 0.1)', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              color: '#ffffff'
            }}
          />
          <Bar dataKey="acertos" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} />
          <Bar dataKey="erros" stackId="a" fill="#cf1313" radius={[0, 0, 0, 0]} />
          <Bar dataKey="nãoResolvidos" stackId="a" fill="#a855f720" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

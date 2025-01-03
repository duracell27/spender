"use client";
import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { TooltipProps } from 'recharts';



type DataType = {
  day: string; // Відповідає осі X
  value: number; // Відповідає осі Y
};
// Типи для `TooltipProps`
type ValueType = number | string  // Дозволені типи значень
type NameType = string; // Тип для назв

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-md p-2 rounded">
        <p className="text-sm font-bold">{`День: ${label}`}</p>
        <p className="text-sm">{`Сума: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const DashboardAreaChart = ({
  data,
  color,
}: {
  data: DataType[];
  color: string;
}) => {
  return (
    
      <ResponsiveContainer width="100%" height="30%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`#${color}`} stopOpacity={0.8} />
              <stop offset="95%" stopColor={`#${color}`} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip/>}/>
          <Area
            type="monotone"
            dataKey="value"
            stroke={`#${color}`}
            fillOpacity={1}
            fill="url(#color)"
          />
        </AreaChart>
      </ResponsiveContainer>
   
  );
};

export default DashboardAreaChart;

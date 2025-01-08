"use client";
import { da } from "date-fns/locale";
import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  Legend,
  BarChart,
  ResponsiveContainer
} from "recharts";
import { TooltipProps } from 'recharts';

type DataType = {
  catName: string; // Відповідає осі X
  sum: number; // Відповідає осі Y
};

// Типи для `TooltipProps`
type ValueType = number | string  // Дозволені типи значень
type NameType = string; // Тип для назв

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-foreground border shadow-md p-2 rounded bg-background text-foreground">
        <p className="text-sm font-bold">{`День: ${label}`}</p>
        <p className="text-sm">{`Сума: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const DashboardBarChart = ({
  data,
  color,
}: {
  data: DataType[];
  color: string;
}) => {
  console.log("chart", data);
  return (
    <ResponsiveContainer width="100%" height="30%">
    <BarChart width={730} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <defs>
        <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={`#${color}`} stopOpacity={0.8} />
          <stop offset="95%" stopColor={`#${color}`} stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <XAxis dataKey="catName" />
      <YAxis />
      <Tooltip content={<CustomTooltip/>}/>
      <Bar
        dataKey="sum"
        stroke={`#${color}`}
        fillOpacity={1}
        fill="url(#color)"
        label={{ fill: "red", fontSize: 20 }}
      />
    </BarChart></ResponsiveContainer>
  );
};

export default DashboardBarChart;

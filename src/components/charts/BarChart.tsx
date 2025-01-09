"use client";
import { Currency, UserSettings } from "@prisma/client";
import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  BarChart,
  ResponsiveContainer,
  TextProps
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

// Define the custom label component props
interface CustomLabelProps extends TextProps {
    x?: number;
    y?: number;
    width?: number;
    value?: number;
    color: string;
    curSymbol: string
  }
  
  // Custom label component
  const CustomLabel: React.FC<CustomLabelProps> = ({ x = 0, y = 0, width = 0, value, color, curSymbol }) => {
    return (
      <text
        x={x + width / 2} // Center the label horizontally
        y={y - 10}        // Position above the bar
        fill={`#${color}`}  // Text color
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-bold"
      >
        {value} {curSymbol}
      </text>
    );
  };

const DashboardBarChart = ({
  data,
  color,
  userSettings
}: {
  data: DataType[];
  color: string;
  userSettings: UserSettings & {defaultCurrency: Currency}
}) => {
  
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
        label={<CustomLabel color={color} curSymbol={userSettings.defaultCurrency.symbol
        }/>}
      />
    </BarChart></ResponsiveContainer>
  );
};

export default DashboardBarChart;

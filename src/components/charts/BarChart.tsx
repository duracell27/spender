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
interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number; // Висота бара
  value?: string | number;
  curSymbol: string;
}

const CustomLabel: React.FC<CustomLabelProps> = ({ x = 0, y = 0, width = 0, height = 0, value, curSymbol }) => {
  const text = `${value} ${curSymbol}`;
  const textWidth = text.length * 6; // Приблизна ширина тексту
  const textHeight = 12; // Приблизна висота тексту
  const padding = 15; // Відступи від меж бара

  const isVertical = width < textWidth; // Якщо ширина бара менша за текст
  const isAboveBar = height < textHeight + padding; // Якщо текст не вміщується у висоту

  return (
    <text
      x={x + width / 2} // Центруємо текст по горизонталі
      y={
        isAboveBar
          ? y - 10 // Якщо не поміщається, виводимо над баром
          : isVertical
          ? y + height / 2 // Вертикальний текст
          : y + 10 // Горизонтальний текст
      }
      fill="#000"
      textAnchor="middle"
      dominantBaseline="middle"
      className="font-bold"
      transform={
        isVertical && !isAboveBar
          ? `rotate(-90, ${x + width / 2}, ${y + height / 2})` // Поворот, якщо вертикальний текст
          : undefined
      }
      style={{
        fontSize: '10px', // Зменшення шрифту для вузьких барів
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
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
    <ResponsiveContainer width="100%" height="40%" >
    <BarChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <defs>
        <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={`#${color}`} stopOpacity={0.8} />
          <stop offset="95%" stopColor={`#${color}`} stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <XAxis dataKey="catName" angle={-90} textAnchor='end' height={110} className="text-[8px] sm:text-sm"/>
      <YAxis />
      <Tooltip content={<CustomTooltip/>}/>
      <Bar
        dataKey="sum"
        stroke={`#${color}`}
        fillOpacity={1}
        fill="url(#color)"
        label={<CustomLabel curSymbol={userSettings.defaultCurrency.symbol
        }/>}
      />
    </BarChart></ResponsiveContainer>
  );
};

export default DashboardBarChart;

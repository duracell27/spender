"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category, Currency, UserSettings } from "@prisma/client";
import { addDays, differenceInDays, format } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import DashboardAreaChart from "../charts/DashboardAreaChart";
import { getExpensesByCategoryAndDate } from "@/actions/transactions";

export default function UserZvitByCategory({
  categories,
  userSettings
}: {
  categories: Category[];
  userSettings: UserSettings;
}) {
  const today = new Date(); // Поточна дата
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 1-ше число поточного місяця

  const daysPassed = differenceInDays(today, firstDayOfMonth);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -daysPassed),
    to: new Date(),
  });
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);
  const [data, setData] = React.useState([])

  console.log("Категорії ", categories);
  console.log("З ", date?.from);
  console.log("До ", date?.to);
  console.log("Категорія ", selectedValue);

  const handleGetChartData = async () =>{
   const data = await getExpensesByCategoryAndDate(selectedValue, date.from, date.to)
   console.log('DATA', data)
   if (data){
    setData(data)
    }
  }

  return (
    <div>
      <Select onValueChange={setSelectedValue}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Виберіть категорію" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Витрати</SelectLabel>
            {categories
              .filter((category) => category.categoryType === "SPENDING")
              .map((category, index) => (
                <SelectItem
                  className="text-red-500"
                  key={index}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Прибутки</SelectLabel>
            {categories
              .filter((category) => category.categoryType === "INCOME")
              .map((category, index) => (
                <SelectItem
                  className="text-green-500"
                  key={index}
                  value={category.id}
                >
                  {category.name}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PP", { locale: uk })} -{" "}
                  {format(date.to, "PP", { locale: uk })}
                </>
              ) : (
                format(date.from, "PP", { locale: uk })
              )
            ) : (
              <span>Виберіть діапазон</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={handleGetChartData}>Сформувати</Button>

      <DashboardAreaChart data={data} color={"f34c38"} userSettings={userSettings}/>
    </div>
  );
}

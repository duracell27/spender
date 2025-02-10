"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDigits } from "@/lib/utils";
import { Category, Currency, UserSettings } from "@prisma/client";
import { addDays, differenceInDays, format } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import DashboardAreaChart from "../charts/DashboardAreaChart";
import { getExpensesByCategoryAndDate, ZvitChartData } from "@/actions/transactions";
import { toast } from "sonner";

export default function UserZvitByCategory({
  categories,
  userSettings,
}: {
  categories: Category[];
  userSettings: UserSettings & { defaultCurrency: Currency };
}) {
  const today = new Date(); // Поточна дата
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 1-ше число поточного місяця
  const daysPassed = differenceInDays(today, firstDayOfMonth);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -daysPassed),
    to: new Date(),
  });
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ZvitChartData[]>([]);
  const [total, setTotal] = React.useState<number>(0);

  const handleGetChartData = async () => {
    if (selectedValue !== null && date !== undefined && date.from !== undefined && date.to !== undefined) {
      const {data, total} = await getExpensesByCategoryAndDate(selectedValue, date.from, date.to, userSettings.defaultCurrencyId);

      if (data) {
        setData(data);
        setTotal(total);
      }
    } else {
      toast("Не всі поля заповнені для звіту");
    }
  };

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
                <SelectItem className="text-red-500" key={index} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Прибутки</SelectLabel>
            {categories
              .filter((category) => category.categoryType === "INCOME")
              .map((category, index) => (
                <SelectItem className="text-green-500" key={index} value={category.id}>
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
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PP", { locale: uk })} - {format(date.to, "PP", { locale: uk })}
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
            locale={uk}
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={handleGetChartData}>Сформувати</Button>
      <div className="flex flex-col gap-4 w-full justify-top h-screen">

      {data.length > 0 ? <><p>Загальні витрати за період {formatDigits(total)}{userSettings.defaultCurrency.symbol}</p><DashboardAreaChart data={data} color={"0390fc"} userSettings={userSettings} /> </>: "Щоб побачити графік витрат, виберіть категорію та діапазон дат"}
      </div>
    </div>
  );
}

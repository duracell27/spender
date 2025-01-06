"use client";
import React, { ReactNode, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addExchange, editExchange } from "@/actions/exchange";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Currency } from "@prisma/client";

// створення схеми через зод
const exchangeSchema = z.object({
  rate: z.coerce.number().min(0, "Курс обов'язковий"),
  date: z.date({ message: "Дата обов'язкова" }),
  firstCurrencyId: z.string().min(1, { message: "Валюта обов'язкова" }),
  secondCurrencyId: z.string().min(1, { message: "Валюта обов'язкова" }),
});

// створення типів на основі схеми
export type ExchangeFormValues = z.infer<typeof exchangeSchema>;

const UserExchangeForm = ({
  title,
  edit,
  data,
  id,
  firstCurrency,
  secondCurrency,
}: {
  title: string | ReactNode;
  edit?: boolean;
  data?: ExchangeFormValues;
  id?: string;
  firstCurrency: Currency;
  secondCurrency: Currency;
}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу

  // створюю обєкт форми з для реакт хук форм
  const form = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeSchema),
  });

  //обробка відправки форми
  async function onSubmit(data: ExchangeFormValues) {
    try {
      if (edit) {
        await editExchange(data, id!);
        toast("Транзакція відредагована!");
      } else {
        await addExchange(data); // Виклик API для додавання категорії
        toast("Транзакція успішно додана!");
      }
      form.reset(); // Очищення форми
      setIsOpen(false); // Закриття діалогу
    } catch (error) {
      console.error(error);
      toast("Щось пішло не так. Спробуйте ще раз.");
    }
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="" asChild>
          <Button onClick={() => setIsOpen(true)}>{title}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit ? (
                <span>Тут можна відредагувати рахунок</span>
              ) : (
                <span>Тут можна додати новий рахунок</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {edit ? <span>Відредагуйте поля</span> : <span>Заповніть поля і натисніть кнопку додати</span>}
            </DialogDescription>
          </DialogHeader>

          {/* Форма НОВА */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
              {/* поле назва початок */}
              <FormField
                control={form.control}
                name="rate"
                defaultValue={edit ? data?.rate : 0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Курс валюти</FormLabel>
                    <FormControl>
                      <Input placeholder="Курс" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле назва кінець */}

              {/* поле дата початок */}
              <FormField
                control={form.control}
                name="date"
                defaultValue={edit ? data?.date : new Date()}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата транзакції</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP", { locale: uk })
                            ) : (
                              <span>Виберіть дату</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={uk}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле дата кінець */}

              {/* поле курс1 початок */}
              {/* <FormField
                control={form.control}
                name="firstCurrencyId"
                disabled
                defaultValue={edit ? data?.firstCurrencyId : firstCurrency.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Валюта 1</FormLabel>
                    <FormControl>
                      <Input  {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="firstCurrencyId"
                defaultValue={edit ? data?.firstCurrencyId : firstCurrency.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Валюта 1</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {/* Поле для відображення назви */}
                        <Input
                          value={firstCurrency.name} // Назва валюти
                          placeholder="Виберіть валюту"
                          disabled
                        />
                        {/* Сховане поле для ID */}
                        <input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле курс1 кінець */}

              {/* поле курс2 початок */}
              {/* <FormField
                control={form.control}
                name="secondCurrencyId"
                disabled
                defaultValue={edit ? data?.secondCurrencyId : secondCurrency.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Валюта 2</FormLabel>
                    <FormControl>
                      <Input placeholder={secondCurrency.name} {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="secondCurrencyId"
                defaultValue={edit ? data?.secondCurrencyId : secondCurrency.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Валюта 2</FormLabel>
                    <FormControl>
                      <div className="relative">
                        {/* Поле для відображення назви */}
                        <Input
                          value={secondCurrency.name} // Назва валюти
                          placeholder="Виберіть валюту"
                          disabled
                        />
                        {/* Сховане поле для ID */}
                        <input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле курс2 кінець */}

              <Button type="submit">{edit ? "Редагувати" : "Створити"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserExchangeForm;

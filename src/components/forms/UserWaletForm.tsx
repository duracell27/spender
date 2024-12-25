"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import { Currency } from "@prisma/client";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { addWallet, editWallet } from "@/actions/wallets";

// створення схеми через зод
const walletSchema = z.object({
  name: z.string().min(1, "Назва рахунку обов'язкова"),
  currencyId: z.string().min(1, "Код валюти обов'язковий"),
  initialBalance: z.coerce.number().min(0, "Початковий баланс обов'язковий"),
  initialBalanceDate: z.date({
    message: "Дата початкового балансу обов'язкова",
  }),
});

// створення типів на основі схеми
export type WalletFormValues = z.infer<typeof walletSchema>;

const UserWaletForm = ({
  title,
  edit,
  data,
  id,
  currencys,
}: {
  title: string | ReactNode;
  edit?: boolean;
  data?: WalletFormValues;
  id?: string;
  currencys: Currency[];
}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу

  // створюю обєкт форми з для реакт хук форм
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
  });
  //обробка відправки форми
  async function onSubmit(data: WalletFormValues) {
    try {
      if (edit) {
        await editWallet(data, id!);
        toast("Рахунок успішно відредагований!");
      } else {
        await addWallet(data); // Виклик API для додавання валюти
        toast("Рахунок успішно доданий!");
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
              {edit ? (
                <span>Відредагуйте поля</span>
              ) : (
                <span>Заповніть поля і натисніть кнопку додати</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Форма НОВА */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
              {/* поле назва початок */}
              <FormField
                control={form.control}
                name="name"
                defaultValue={edit ? data?.name : ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Назва рахунку</FormLabel>
                    <FormControl>
                      <Input placeholder="Назва" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле назва кінець */}
              {/* поле валюта початок */}
              <FormField
                control={form.control}
                name="currencyId"
                defaultValue={edit ? data?.currencyId : ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Валюта</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={edit ? data?.currencyId : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть валюту" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencys.map((currency, index) => (
                          <SelectItem key={index} value={currency.id}>
                            {currency.name} {currency.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле валюта кінець */}
              {/* поле початкова сума початок */}
              <FormField
                control={form.control}
                name="initialBalance"
                defaultValue={edit ? data?.initialBalance : 0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Початковий баланс</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле початкова сума кінець */}
              {/* поле дата початок */}
              <FormField
                control={form.control}
                name="initialBalanceDate"
                defaultValue={edit ? data?.initialBalanceDate : new Date()}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата початкового балансу</FormLabel>
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле дата кінець */}

              <Button type="submit">{edit ? "Редагувати" : "Створити"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserWaletForm;

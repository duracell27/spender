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
import { Input } from "../ui/input";
import { addTransaction, editTransaction } from "@/actions/transactions";
import {
  Category,
  TransactionType,
  UserSettings,
  Wallet,
} from "@prisma/client";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";

// створення схеми через зод
const transactionSchema = z.object({
  title: z.string().min(1, "Назва витрати обов'язкова"),
  amount: z.coerce.number().min(0, "Сума обов'язкова"),
  transactionType: z.enum(["DEBIT", "CREDIT"]),
  categoryId: z.string().min(1, "Категорія обов'язкова"),
  walletId: z
    .string({
      required_error: "Виберіть рахунок",
    })
    .min(1, "Рахунок обов'язковий")
    .refine((value) => value !== "all", {
      message: "Виберіть певних рахунок",
    }),
  date: z.date({
    message: "Дата транзакції обов'язкова",
  }),
});

// створення типів на основі схеми
export type TransactionFormValues = z.infer<typeof transactionSchema>;

const UserTransactionForm = ({
  title,
  edit,
  data,
  id,
  initType,
  wallets,
  categories,
  userSettings,
}: {
  title: string | ReactNode;
  edit?: boolean;
  data?: TransactionFormValues;
  id?: string;
  initType: TransactionType;
  wallets: Wallet[];
  categories: Category[];
  userSettings: UserSettings;
}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу

  // створюю обєкт форми з для реакт хук форм
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  });

  if (userSettings && (form.getValues().walletId === undefined)) {
    if(userSettings.activeWalletId === 'all'){
      form.setValue("walletId", '');
    }else{
      form.setValue("walletId", userSettings.activeWalletId);
    }
  }

  //обробка відправки форми
  async function onSubmit(data: TransactionFormValues) {
    try {
      if (edit) {
        await editTransaction(data, id!);
        toast("Транзакція відредагована!");
      } else {
        await addTransaction(data); // Виклик API для додавання категорії
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
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          setIsOpen(!isOpen)
          form.reset();
        }}
      >
        <DialogTrigger className="" asChild>
          <Button
            className={
              edit
                ? "bg-primary"
                : initType === "CREDIT"
                ? "bg-red-500 p-10"
                : "bg-green-500 p-10"
            }
            onClick={() => setIsOpen(true)}
          >
            {title}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit ? (
                <span>Тут можна відредагувати транзакцію</span>
              ) : (
                <span>Тут можна додати нову транзакцію</span>
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
                name="title"
                defaultValue={edit ? data?.title : ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Назва транзакції</FormLabel>
                    <FormControl>
                      <Input placeholder="Назва" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле назва кінець */}
              {/* поле сума початок */}
              <FormField
                control={form.control}
                name="amount"
                defaultValue={edit ? data?.amount : 0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сума транзакції</FormLabel>
                    <FormControl>
                      <Input placeholder="Сума" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле сума кінець */}
              {/* поле тип транзакції початок */}
              <FormField
                control={form.control}
                name="transactionType"
                defaultValue={edit ? data?.transactionType : initType}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип транзакції</FormLabel>
                    <Select
                      onValueChange={(value)=>{field.onChange(value)
                       
                         form.resetField('categoryId')
                      }}
                      defaultValue={edit ? data?.transactionType : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={"CREDIT"}>
                          <span className="text-red-500">Витрата</span>
                        </SelectItem>
                        <SelectItem value={"DEBIT"}>
                          <span className="text-green-500">Дохід</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле тип транзакції кінець */}
              {/* поле категорія початок */}
              <FormField
                control={form.control}
                name="categoryId"
                defaultValue={edit ? data?.categoryId : ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Категорія</span>
                      <span>
                        <Link href="/dashboard/categories">Додати нову?</Link>
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={edit ? data?.categoryId : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть категорію" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category, index) => {
                          if (
                             form.getValues().transactionType === "DEBIT" &&
                            category.categoryType === "INCOME"
                          ) {
                            return (
                              <SelectItem key={index} value={category.id}>
                                {category.name}
                              </SelectItem>
                            );
                          } else if (
                            form.getValues().transactionType === "CREDIT" &&
                            category.categoryType === "SPENDING"
                          ) {
                            return (
                              <SelectItem key={index} value={category.id}>
                                {category.name}
                              </SelectItem>
                            );
                          }
                        })}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле категорія кінець */}
              {/* поле рахунок початок */}
              <FormField
                control={form.control}
                name="walletId"
                // value={edit ? data?.walletId : userSettings.activeWalletId}
                defaultValue={
                  edit ? data?.walletId : userSettings.activeWalletId
                }
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Рахунок</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть рахунок" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets.map((wallet, index) => (
                          <SelectItem key={index} value={wallet.id}>
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле рахунок кінець */}
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

export default UserTransactionForm;

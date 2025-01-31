"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Currency, ExchangeRate, Wallet } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { formatDigits } from "@/lib/utils";
import { Input } from "../ui/input";
import { addTransfer, editTransfer } from "@/actions/transfer";
// import { set } from "date-fns";
// import { editUserSettings } from "@/actions/userSettings";

type WalletWithCurrency = Wallet & { currency: Currency };
// створення схеми через зод
const transferSchema = z.object({
  fromWalletId: z.string().min(1, "Виберіть з якого рахунока"),
  amount: z.coerce.number().min(0, "Кількість витрати обов'язкова").default(0),
  toWalletId: z.string().min(1, "Виберіть на який рахунок"),
});

// створення типів на основі схеми
export type TransferFormValues = z.infer<typeof transferSchema>;

const UserTransferMoneyForm = ({
  wallets,
  title,
  edit,
  exchangeRates,
  data,
  id
}: //data,
// currencies,
// userSettings,
{
  wallets: WalletWithCurrency[];
  title: string | ReactNode;
  edit?: boolean;
  id?: string;
  data?: TransferFormValues;
  exchangeRates: ExchangeRate[];
  // currencies: Currency[];
  // userSettings: UserSettings;
}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [toWalletSymbol, setToWalletSymbol] = useState<string>("");

  // створюю обєкт форми з для реакт хук форм
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
  });

  //обробка відправки форми
  async function onSubmit(data: TransferFormValues) {
    try {
          if (edit) {
            await editTransfer(data, exchangeRate, id!);
            toast("Транзакція відредагована!");
          } else {
            await addTransfer(data, exchangeRate); // Виклик API для додавання категорії
            toast("Транзакція успішно додана!");
          }
          form.reset(); // Очищення форми
          setIsOpen(false); // Закриття діалогу
        } catch (error) {
          console.error(error);
          toast("Щось пішло не так. Спробуйте ще раз.");
        }
  }
  const fromWallet = form.watch("fromWalletId");
  const toWallet = form.watch("toWalletId");
  const amount = form.watch("amount");


  const getExchangeRate = async (fromWallet: string, toWallet: string) => {
    const fromWalletObj = wallets.find((wallet) => wallet.id === fromWallet);
    const toWalletObj = wallets.find((wallet) => wallet.id === toWallet);

    if (toWalletObj) {
      setToWalletSymbol(toWalletObj.currency.symbol);
    }

    if (fromWalletObj && toWalletObj) {
      const exchangeRate = exchangeRates.find(
        (rate) =>
          rate.firstCurrencyId === toWalletObj.currencyId &&
          rate.secondCurrencyId === fromWalletObj.currencyId
      );
      if (exchangeRate) {
        setExchangeRate(exchangeRate.rate);
      } else {
        setExchangeRate(1); // Reset if no rate is found
      }
    }
  };

  // Trigger exchange rate calculation when fromWallet or toWallet changes
  useEffect(() => {
    if (fromWallet && toWallet) {
      getExchangeRate(fromWallet, toWallet);
    }
  }, [fromWallet, toWallet]); // Run whenever fromWallet or toWallet changes

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
                <span>Тут можна відредагувати переміщення коштів</span>
              ) : (
                <span>Тут можна додати нове переміщення коштів</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {edit ? (
                <span>Відредагуйте поля</span>
              ) : (
                <span>Заповніть поля і натисніть кнопку зберегти</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Форма НОВА */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
              {/* поле з рахунок початок */}
              <FormField
                control={form.control}
                name="fromWalletId"
                defaultValue={edit ? data?.fromWalletId : ''}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>З рахунка</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              {/* поле з рахунок кінець */}

              {/* поле назва початок */}
              <FormField
                control={form.control}
                name="amount"
                defaultValue={edit ? data?.amount : 0}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сума переводу</FormLabel>
                    <FormControl>
                      <Input placeholder="Сума" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле назва кінець */}
              {amount ? `Сума: ~ ${formatDigits(exchangeRate * amount, 4)} ${toWalletSymbol}` : ""}
              {}

              {/* поле на рахунок початок */}
              <FormField
                control={form.control}
                name="toWalletId"
                  defaultValue={edit ? data?.toWalletId : ''}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>На рахунок</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              {/* поле на рахунок кінець */}

              <Button type="submit">{"Зберегти"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTransferMoneyForm;

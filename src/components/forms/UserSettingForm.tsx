"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Currency, UserSettings, Wallet } from "@prisma/client";
import { editUserSettings } from "@/actions/userSettings";

// створення схеми через зод
const settingsSchema = z.object({
  activeWalletId: z.string().min(1, "Виберіть стандартний рахунок"),
  defaultCurrencyId: z.string().min(1, "Виберіть стандартну валюту"),
  defaultPeriod: z.enum(["DAY", "WEEK", "MONTH", "YEAR"], { message: "Виберіть стандартний період" }),
  defaultLanguage: z.enum(["UA"], { message: "Виберіть стандартну мову" }),
});

// створення типів на основі схеми
export type SettingsFormValues = z.infer<typeof settingsSchema>;

const UserSettingForm = ({
  wallets,
  currencies,
  userSettings,
}: {
  wallets: Wallet[];
  currencies: Currency[];
  userSettings: UserSettings;
}) => {
  // створюю обєкт форми з для реакт хук форм
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  //обробка відправки форми
  async function onSubmit(data: SettingsFormValues) {
    try {
      
      await editUserSettings(data, userSettings.id);
      toast("Транзакція успішно додана!");
    } catch (error) {
      console.error(error);
      toast("Щось пішло не так. Спробуйте ще раз.");
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
          {/* поле рахунок початок */}
          <FormField
            control={form.control}
            name="activeWalletId"
             defaultValue={userSettings.activeWalletId}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Рахунок</FormLabel>
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
          {/* поле рахунок кінець */}

          {/* поле валюта початок */}
          <FormField
            control={form.control}
            name="defaultCurrencyId"
             defaultValue={userSettings.defaultCurrencyId}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Валюта</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть валюту" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency, index) => (
                      <SelectItem key={index} value={currency.id}>
                        {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* поле валюта кінець */}

          {/* поле тип періоду початок */}
          <FormField
            control={form.control}
            name="defaultPeriod"
             defaultValue={userSettings.defaultPeriod}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Період</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть періоду" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key={"day"} value={"DAY"}>
                      День
                    </SelectItem>
                    <SelectItem key={"week"} value={"WEEK"}>
                      Тиждень
                    </SelectItem>
                    <SelectItem key={"month"} value={"MONTH"}>
                      Місяць
                    </SelectItem>
                    <SelectItem key={"year"} value={"YEAR"}>
                      Рік
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* поле валюта кінець */}

          {/* поле мова початок */}
          <FormField
            control={form.control}
            name="defaultLanguage"
             defaultValue={userSettings.defaultLanguage}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Мова</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Виберіть мову" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key={"ua"} value={"UA"}>
                      Українська
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* поле мова кінець */}

          <Button type="submit">{"Зберегти"}</Button>
        </form>
      </Form>
    </div>
  );
};

export default UserSettingForm;

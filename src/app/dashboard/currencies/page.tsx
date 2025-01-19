import { Separator } from "@/components/ui/separator";
import React from "react";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import UserExchangeForm from "@/components/forms/UserExchangeForm";
import { formatDigits } from "@/lib/utils";
import Confirm from "@/components/Confirm";
import { Pencil, Trash2 } from "lucide-react";
import { deleteExchange } from "@/actions/exchange";
// import { Currency, UserSettings } from "@prisma/client";

const CurrenciesPage = async () => {
  const session = await auth();
  if (!session?.user.id) return;

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      defaultCurrency: true,
    },
  });

  if (!userSettings?.id) return null;

  const exchanges = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      currency1: true,
      currency2: true,
    },
  });

  const currencies = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
      currencyId: {
        not: userSettings.defaultCurrencyId, // Замініть activeCurrencyId на ID активної валюти
      },
    },
    select: {
      currency: true, // Вибираємо лише поле `currency`
    },
    distinct: ["currencyId"], // Унікальні значення за `currencyId`
  });



  return (
    <div className="px-2">
      <div className="">
        Ваша основна валюта: <span className="font-bold ">{userSettings?.defaultCurrency.name}</span>
      </div>
      <Separator />
      {currencies.length === 0 ? <>
      <p>У вас немає рахунків з відмінною від основної валюти</p>
      </> : ""}

      {currencies.map((currency) => (
        <div key={currency.currency.id}>
          <Separator />
          <div className="flex justify-between items-center my-2">
            <h1 className="font-bold text-2xl">{currency.currency.name}</h1>
            <UserExchangeForm
              title={"Додати курс"}
              firstCurrency={userSettings?.defaultCurrency}
              secondCurrency={currency.currency}
            />
          </div>

          {
  exchanges.filter(
    (item) =>
      item.firstCurrencyId === userSettings.defaultCurrencyId &&
      item.secondCurrencyId === currency.currency.id
  ).length === 0 ? (
    <p className="text-foreground text-center bg-red-600 rounded-lg mb-2">Варіанти обміну не знайдено</p>
  ) : (
    exchanges
      .filter(
        (item) =>
          item.firstCurrencyId === userSettings.defaultCurrencyId &&
          item.secondCurrencyId === currency.currency.id
      )
      .map((item) => (
        <div key={item.id} className="my-2 flex justify-between">
          <p className="bg-foreground text-background flex items-center rounded-2xl px-2">
            1 {item.currency2.code} = {formatDigits(item.rate)} {item.currency1.code}{" "}
          </p>
          <p className="text-foreground">{format(item.date, "PP", { locale: uk })}</p>
          <div className="flex items-center gap-2">
            <UserExchangeForm
              title={<Pencil />}
              firstCurrency={userSettings?.defaultCurrency}
              secondCurrency={currency.currency}
              edit={true}
              data={item}
              id={item.id}
            />
            <Confirm
              title={<Trash2 />}
              actionButtonTitle="Видалити"
              fn={deleteExchange}
              id={item.id}
            />
          </div>
        </div>
      ))
  )
}


          <Separator />
        </div>
      ))}
    </div>
  );
};

export default CurrenciesPage;

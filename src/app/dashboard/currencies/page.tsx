import { Separator } from "@/components/ui/separator";
import React from "react";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import UserExchangeForm from "@/components/forms/UserExchangeForm";
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
  })

  if (!userSettings?.id) return null;

  const exchanges = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
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

  // console.log("обміни", exchanges);

  return (
    <div>
      <div className="">Ваша основна валюта: {userSettings?.defaultCurrency.name}</div>
      <Separator />
      <div className="">Валюти і курси: </div>
      {currencies.map((currency) => (
        <div key={currency.currency.name}>
          {currency.currency.name}
          {exchanges
            .filter(
              (item) =>
                item.firstCurrencyId === userSettings.defaultCurrencyId &&
                item.secondCurrencyId === currency.currency.id
            )
            .map((item) => (
              <p key={item.id}>{item.rate} - {format(item.date, "PP", { locale: uk })}</p>
            ))}

          <UserExchangeForm
            title={"Додати курс"}
            firstCurrency={userSettings?.defaultCurrency}
            secondCurrency={currency.currency}
          />
        </div>
      ))}
    </div>
  );
};

export default CurrenciesPage;

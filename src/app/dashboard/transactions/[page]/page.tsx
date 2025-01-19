import React from "react";
import { auth } from "../../../../../auth";
import { prisma } from "../../../../../prisma/prisma";
import DashboardTabs from "@/components/tabs/DashboardTabs";
import { ActiveWalletSelect } from "@/components/forms/UserDashboardWaletSelect";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Params = Promise<{ page: string }>

const TransactionPage = async ({ params, searchParams }: { params: Params, searchParams: { tab?: string } }) => {

  console.log('params', params)

  const { page } = await params; // отримуємо номер сторінки для пагінації
  const pageNumber = parseInt(page, 10) || 1 // якщо не було передано номер сторінки пагінації то ставив першу
  const searchParam = searchParams.tab; // отримуємо параметр з строки щоб визначити яку вкладку потрібно відобразити

  const session = await auth();
  if (!session?.user.id) return;
  // отримаємо всі рахунки користувача
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
  });
  // отримаємо всі категорії користувача
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
  });
  // отримаємо всі курси валют користувача
  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
    },
  });
  // отримаємо налаштування користувача
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      defaultCurrency: true,
    },
  });

  if (!userSettings?.id) return null; // якщо не знайдено налаштувань користувача то повертаємо null
  // якщо немає рахунків то пропонуємо додати рахунок
  if (wallets.length === 0)
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-center">
          <p>Ваші рахунки не знайдено</p>
          <p>Будь ласка, додайте рахунок для перегляду транзакцій</p>
          <Link className="mt-4" href="/dashboard/wallets">
            <Button>Додати</Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="p-4">
      {userSettings?.id && (
        <ActiveWalletSelect wallets={wallets} userSettings={userSettings} />
      )}

      <DashboardTabs
        wallets={wallets}
        categories={categories}
        userSettings={userSettings}
        exchangeRates={exchangeRates}
        pageNumber={pageNumber}
        searchParam={searchParam}
      />
    </div>
  );
};

export default TransactionPage;

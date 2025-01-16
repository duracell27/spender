
import React from "react";
import { auth } from "../../../../auth";
import { prisma } from "../../../../prisma/prisma";

import DashboardTabs from "@/components/tabs/DashboardTabs";
// import WalletSelect from "@/components/WalletSelect";
import { ActiveWalletSelect } from "@/components/forms/UserDashboardWaletSelect";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Currency, UserSettings } from "@prisma/client";
// import DashboardWrapper from "@/components/DashboardWrapper";

const TransactionPage = async ({ searchParams }: { searchParams: { tab?: string } }) => {
  
  const session = await auth();
  if (!session?.user.id) return;
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
  });
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy:{
      name: 'asc'
    }
  });
  
  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
    },
    // include: {
      //   currency1: true,
      //   currency2: true,
      // },
    })
    
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        defaultCurrency: true,
      },
    }) 
  const {tab} = await searchParams || userSettings?.defaultPeriod

  if (!userSettings?.id) return null

  if(wallets.length===0) return (
    <div className="flex h-screen justify-center items-center">
      <div className="text-center">
        <p>Ваші рахунки не знайдено</p>
        <p>Будь ласка, додайте рахунок для перегляду транзакцій</p>
        <Link className="mt-4" href="/dashboard/wallets"><Button>Додати</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="p-4">
      {userSettings?.id && (<ActiveWalletSelect wallets={wallets} userSettings={userSettings}/>)}
      
      <DashboardTabs wallets={wallets} categories={categories} userSettings={userSettings} exchangeRates={exchangeRates} pageNumber={1} searchParam={tab}/>
    </div>
  );
};

export default TransactionPage;

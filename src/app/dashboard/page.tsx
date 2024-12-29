import UserTransactionForm from "@/components/forms/UserTransactionForm";
import React from "react";
import { auth } from "../../../auth";
import { prisma } from "../../../prisma/prisma";

import DashboardTabs from "@/components/tabs/DashboardTabs";
// import WalletSelect from "@/components/WalletSelect";
import { ActiveWalletSelect } from "@/components/forms/UserDashboardWaletSelect";
import Link from "next/link";
// import DashboardWrapper from "@/components/DashboardWrapper";

const DashboardPage = async () => {
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
  });
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!userSettings?.id) return null

  if(wallets.length===0) return (
    <div className="flex h-screen justify-center items-center">
      <div className="text-center">
        <p>Ваші рахунки не знайдено</p>
        <p>Будь ласка, додайте рахунок для перегляду транзакцій</p>
        <Link href="/dashboard/wallets">Додати</Link>
      </div>
    </div>
  )

  return (
    <div className="">

      {/* <DashboardWrapper wallets={wallets} categories={categories}/> */}
      {userSettings?.id && (<ActiveWalletSelect wallets={wallets} userSettings={userSettings}/>)}

      {/* <WalletSelect wallets={wallets}/> */}
      <DashboardTabs wallets={wallets} categories={categories} userSettings={userSettings}/>

      <div className="flex items-center gap-2">
        <UserTransactionForm
          title="Дохід"
          initType="DEBIT"
          wallets={wallets}
          categories={categories}
        />
        <UserTransactionForm
          title="Витрата"
          initType="CREDIT"
          wallets={wallets}
          categories={categories}
        />
      </div>



    </div>
  );
};

export default DashboardPage;

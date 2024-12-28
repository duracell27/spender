import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import Confirm from "@/components/Confirm";
import {
  deleteTransaction,
  getTransactionsByPeriod,
} from "@/actions/transactions";
import { calculateBalanceAndSums } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { auth } from "../../../auth";
import UserTransactionForm from "../forms/UserTransactionForm";
import { Category, UserSettings, Wallet } from "@prisma/client";

const DayTab = async ({
  wallets,
  categories,
  userSettings,
}: {
  wallets: Wallet[];
  categories: Category[];
  userSettings: UserSettings;
}) => {
  const session = await auth();
  if (!session?.user.id) return;
  const {transactions, startDate } = await getTransactionsByPeriod("year", userSettings.activeWalletId);

  const { balance, creditSum, debitSum } =
    calculateBalanceAndSums(transactions);

  return (
    <div>
      <div className="">Баланс {balance}</div>
      <div className="text-green-500">Прибуток {debitSum}</div>
      <div className="text-red-500">Витрати {creditSum}</div>
      <div className="">{format(startDate, "yyyy", {locale: uk})}</div>
      <div className="">
        {transactions.map((transaction, inex) => (
          <div key={inex} className="flex justify-between">
            <span>{format(transaction.date, "dd.MM.yyyy", { locale: uk })}</span>
            <h1 className="font-bold">{transaction.title}</h1>
            <p>
              {transaction.amount}{" "}
              {transaction.transactionType === "DEBIT" ? (
                <span className="text-green-500">Дохід</span>
              ) : (
                <span className="text-red-500">Витрата</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <UserTransactionForm
                title={<Pencil />}
                edit={true}
                data={transaction}
                id={transaction.id}
                wallets={wallets}
                initType={transaction.transactionType}
                categories={categories}
              />
              <Confirm
                title={<Trash2 />}
                actionButtonTitle="Видалити"
                fn={deleteTransaction}
                id={transaction.id}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayTab;

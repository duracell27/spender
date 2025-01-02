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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    calculateBalanceAndSums(wallets, userSettings.activeWalletId);

  return (
    <div>
      <div className="font-bold text-center my-4 text-2xl">
        {format(startDate, "yyyy", { locale: uk })}
      </div>
      <div className="flex justify-evenly ">
        <div className="text-green-500 p-3 px-5 bg-green-200 rounded-full">Прибуток {debitSum}</div>
        <div
          className={
            balance >= 0
              ? "text-green-500 p-3 px-5 bg-green-200 rounded-full"
              : "text-red-500 p-3 px-5 bg-red-200 rounded-full"
          }
        >
          Баланс {balance}
        </div>
        <div className="text-red-500 p-3 px-5 bg-red-200 rounded-full">Витрати {creditSum}</div>
      </div>

      <div className="flex items-center gap-4 my-4 justify-center">
        <UserTransactionForm title="Дохід" initType="DEBIT" wallets={wallets} categories={categories} userSettings={userSettings}/>
        <UserTransactionForm title="Витрата" initType="CREDIT" wallets={wallets} categories={categories} userSettings={userSettings}/>
      </div>

      <div className="">
        <Table>
          <TableCaption className="caption-top font-bold">Лист транзакцій</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Дата</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead className="">Категорія</TableHead>
              <TableHead className="">Рахунок</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                className={transaction.transactionType === "DEBIT" ? "bg-green-200" : "bg-red-200"}
                key={transaction.id}
              >
                <TableCell>{format(transaction.date, "dd.MM.yyyy", { locale: uk })}</TableCell>
                <TableCell>{transaction.title}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell className="font-medium">{transaction.category.name}</TableCell>
                <TableCell className="font-medium">{transaction.wallet.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <UserTransactionForm
                      title={<Pencil />}
                      edit={true}
                      data={transaction}
                      id={transaction.id}
                      wallets={wallets}
                      initType={transaction.transactionType}
                      categories={categories}
                      userSettings={userSettings}
                    />
                    <Confirm
                      title={<Trash2 />}
                      actionButtonTitle="Видалити"
                      fn={deleteTransaction}
                      id={transaction.id}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DayTab;

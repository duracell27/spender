import UserTransactionForm from "@/components/forms/UserTransactionForm";
import React from "react";
import { auth } from "../../../auth";
import { prisma } from "../../../prisma/prisma";
import { Pencil, Trash2 } from "lucide-react";
import Confirm from "@/components/Confirm";
import { deleteTransaction } from "@/actions/transactions";
import { calculateBalance } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

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

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
    },
  });
  

  console.log(transactions);
  return (
    <div className="">
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


      <div className="">Баланс {calculateBalance(transactions)}</div>
      <div className="">
        {transactions.map((transaction, inex) => (
          <div key={inex} className="flex justify-between">
            <span>{format(transaction.createdAt, "PP", { locale: uk })}</span>
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

export default DashboardPage;

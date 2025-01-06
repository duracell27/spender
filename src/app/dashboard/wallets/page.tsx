import UserWaletForm from "@/components/forms/UserWaletForm";
import React from "react";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import { Pencil, Trash2 } from "lucide-react";
import Confirm from "@/components/Confirm";
import { deleteWallet } from "@/actions/wallets";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDigits } from "@/lib/utils";

const WaletsPage = async () => {
  const currencys = await prisma.currency.findMany();
  const session = await auth();
  if (!session?.user.id) return;
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      currency: true,
    },
  });

  return (
    <div className="">
      <UserWaletForm title="Додати рахунок" currencys={currencys} />

      <Table>
        <TableCaption className="caption-top">Лист рахунків</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Назва</TableHead>
            <TableHead>Баланс</TableHead>

            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell className="font-medium">{wallet.name}</TableCell>
              <TableCell>
                {formatDigits( wallet.balance)} {wallet.currency.symbol}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <UserWaletForm
                    title={<Pencil />}
                    edit={true}
                    data={wallet}
                    id={wallet.id}
                    currencys={currencys}
                  />
                  <Confirm
                    title={<Trash2 />}
                    actionButtonTitle="Видалити"
                    fn={deleteWallet}
                    id={wallet.id}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      
    </div>
  );
};

export default WaletsPage;

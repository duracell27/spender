import UserWaletForm from "@/components/forms/UserWaletForm";
import React from "react";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
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
import UserTransferMoneyForm from "@/components/forms/UserTransferMoneyForm";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { deleteTransfer } from "@/actions/transfer";

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

  const exchangeRates = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const transfers = await prisma.transfer.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      wallet1: {
        select: {
          name: true,
          currency: {
            select: {
              symbol: true,
            },
          },
        },
      },
      wallet2: {
        select: {
          name: true,
          currency: {
            select: {
              symbol: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="">
      <div className="flex gap-2">
        <UserWaletForm title="Додати рахунок" currencys={currencys} />
        <UserTransferMoneyForm title="Перевести кошти" wallets={wallets} exchangeRates={exchangeRates} />
      </div>

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
                {formatDigits(wallet.balance)} {wallet.currency.symbol}
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
                  <Confirm title={<Trash2 />} actionButtonTitle="Видалити" fn={deleteWallet} id={wallet.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Table>
        <TableCaption className="caption-top">Лист переказів</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Дата</TableHead>
            <TableHead>З рахунку</TableHead>
            <TableHead>Сума</TableHead>
            <TableHead>На рахунок</TableHead>

            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((trasfer) => (
            <TableRow key={trasfer.id}>
              <TableCell className="font-medium">
                {format(trasfer.createdAt, "dd.MM", { locale: uk })}
              </TableCell>
              <TableCell>{trasfer.wallet1.name}</TableCell>

              <TableCell className="flex gap-2">
                {formatDigits(trasfer.amount)} {trasfer.wallet1.currency.symbol}
                <ArrowRightLeft className="size-4" />
                {formatDigits(trasfer.changed)} {trasfer.wallet2.currency.symbol}
              </TableCell>

              <TableCell>{trasfer.wallet2.name}</TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <UserTransferMoneyForm
                    title={<Pencil />}
                    edit={true}
                    data={trasfer}
                    id={trasfer.id}
                    wallets={wallets}
                    exchangeRates={exchangeRates}
                  />
                  <Confirm
                    title={<Trash2 />}
                    actionButtonTitle="Видалити"
                    fn={deleteTransfer}
                    id={trasfer.id}
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

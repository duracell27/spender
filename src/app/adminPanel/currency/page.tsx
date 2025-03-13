import AdminCurrencyForm from "@/components/forms/AdminCurrencyForm";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator";

import { Pencil, Trash2 } from "lucide-react";

import { deleteCurrency } from "@/actions/currency";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import Confirm from "@/components/Confirm";

const AdminCurency = async () => {
  const currencys = await prisma.currency.findMany();
  const session = await auth();
  return (
    <div className="p-4">
      <AdminCurrencyForm title="Додати валюту" />

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>№</TableHead>
            <TableHead>Назва</TableHead>
            <TableHead>Код</TableHead>
            <TableHead className="text-right">Символ</TableHead>
            {session?.user?.role === "ADMIN" && (
              <TableHead className="text-right">Дії</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencys.map((currency, index) => (
            <TableRow key={currency.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{currency.name}</TableCell>
              <TableCell>{currency.code}</TableCell>
              <TableCell className="text-right">{currency.symbol}</TableCell>
              {session?.user?.role === "ADMIN" && (
                <TableCell className="text-right flex gap-2 justify-end">
                  <AdminCurrencyForm
                    title={<Pencil />}
                    edit={true}
                    data={currency}
                    id={currency.id}
                  />
                  <Confirm
                    title={<Trash2 />}
                    actionButtonTitle="Видалити"
                    message="Валюта видалена успішно"
                    fn={deleteCurrency}
                    id={currency.id}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCurency;

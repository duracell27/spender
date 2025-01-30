import React from "react";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import UserCategoryForm from "@/components/forms/UserCategoryForm";
import { Pencil, Trash2 } from "lucide-react";
import Confirm from "@/components/Confirm";
import { deleteCategory } from "@/actions/categories";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CategoriesPage = async () => {
  const session = await auth();
  if (!session?.user.id) return;

  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [
      {categoryType: "asc"},
      {name: "asc"}
    ]
    
  });

  return (
    <div className="">
      <UserCategoryForm title="Додати категорію" />
      {!categories.length && (
        <div className="flex h-screen justify-center items-center">
          <div className="text-center">
            <p>У вас ще немає категорій витрат</p>
          </div>
        </div>
      )}

      <Table>
        <TableCaption className="caption-top">Лист категорій</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Назва</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                {category.categoryType === "SPENDING" ? (
                  <span className="text-red-500 font-bold">Витрата</span>
                ) : category.categoryType === "INCOME" ? (
                  <span className="text-green-500 font-bold">Дохід</span>
                ): category.categoryType === "TRANSFER" ?(<span className="text-gray-500 font-bold">Перенесення</span>):(<span className="text-gray-500 font-bold">Внесення</span>)}
              </TableCell>
              <TableCell className="text-right">
                {( category.categoryType !== 'TRANSFER' && category.categoryType !== 'INIT') ? (<div className="flex items-center justify-end gap-2">
                  <UserCategoryForm
                    title={<Pencil />}
                    edit={true}
                    data={category}
                    id={category.id}
                  />
                  <Confirm
                    title={<Trash2 />}
                    actionButtonTitle="Видалити"
                    fn={deleteCategory}
                    id={category.id}
                  />
                </div>):('') }
                
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>
  );
};

export default CategoriesPage;

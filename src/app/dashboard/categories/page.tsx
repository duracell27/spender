import React from "react";
import { prisma } from "../../../../prisma/prisma";
import { auth } from "../../../../auth";
import UserCategoryForm from "@/components/forms/UserCategoryForm";
import { Pencil, Trash2 } from "lucide-react";
import Confirm from "@/components/Confirm";
import { deleteCategory } from "@/actions/categories";

const CategoriesPage = async() => {
  const session = await auth();
  if (!session?.user.id) return;
  const categories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <div className="">
      <UserCategoryForm title="Додати категорію" />
      {!categories.length && <div>немає категорій</div>}
      {categories.map((category, inex) => (
        <div key={inex} className="flex justify-between">
          <h1 className="font-bold">{category.name}</h1>
          <p>{category.categoryType==="SPENDING"?(<span className="text-red-500">Витрата</span>):(<span className="text-green-500">Дохід</span>)}</p>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoriesPage
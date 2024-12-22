'use client'

import React, { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCurrency, editCurrency } from "@/actions/currency";
import { toast } from "sonner";

// Описуємо схему валідації за допомогою Zod
const currencySchema = z.object({
  name: z.string().min(1, "Назва валюти обов'язкова"),
  code: z.string().length(3, "Код валюти повинен містити рівно 3 символи"),
  symbol: z.string().min(1, "Символ валюти обов'язковий"),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

const AdminCurrencyForm = ({title, edit, data, id}:{title: string | ReactNode, edit?: boolean, data?: CurrencyFormValues, id?:string}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу

  // Налаштовуємо react-hook-form із zodResolver
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
  });

  // Обробник форми
  const onSubmit = async (data: CurrencyFormValues) => {
    try {
      if(edit){
        await editCurrency(data, id!)
        toast("Валюта успішно відредагована!");
      }else{
        await addCurrency(data); // Виклик API для додавання валюти
        toast("Валюта успішно додана!");
      }
      reset(); // Очищення форми
      setIsOpen(false); // Закриття діалогу
    } catch (error) {
      console.error(error);
      toast("Щось пішло не так. Спробуйте ще раз.");
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="mb-4" asChild>
          <Button onClick={() => setIsOpen(true)}>{title}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? (<span>Тут можна відредагувати валюту</span>):(<span>Тут можна додати нову валюту в програму</span>)}</DialogTitle>
            <DialogDescription>
            {edit ? (<span>Відредагуйте поля</span>):(<span>Заповніть три поля і натисніть кнопку додати</span>)}
            </DialogDescription>
          </DialogHeader>
          {/* Форма */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
          >
            {/* Поле Назва валюти */}
            <div>
              <Input
                placeholder="Назва валюти"
                {...register("name")}
                defaultValue={edit? data?.name :""}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Поле Код валюти */}
            <div>
              <Input
                placeholder="Код валюти (3 символи)"
                {...register("code")}
                defaultValue={edit? data?.code :""}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-red-500 text-sm">{errors.code.message}</p>
              )}
            </div>

            {/* Поле Символ валюти */}
            <div>
              <Input
                placeholder="Символ валюти"
                {...register("symbol")}
                defaultValue={edit? data?.symbol :""}
                className={errors.symbol ? "border-red-500" : ""}
              />
              {errors.symbol && (
                <p className="text-red-500 text-sm">{errors.symbol.message}</p>
              )}
            </div>

            {/* Кнопка додати */}
            <Button type="submit">{edit?'Редагувати':'Додати'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCurrencyForm;

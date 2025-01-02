"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { addCategory, editCategory } from "@/actions/categories";

// створення схеми через зод
const categorySchema = z.object({
  name: z.string().min(1, "Назва категорії обов'язкова"),
  categoryType: z.enum(['SPENDING', 'INCOME', "INIT"])
});

// створення типів на основі схеми
export type CategoryFormValues = z.infer<typeof categorySchema>;

const UserCategoryForm = ({
  title,
  edit,
  data,
  id,
}: {
  title: string | ReactNode;
  edit?: boolean;
  data?: CategoryFormValues;
  id?: string;
  
}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу

  // створюю обєкт форми з для реакт хук форм
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });
  //обробка відправки форми
  async function onSubmit(data: CategoryFormValues) {
    try {
      if (edit) {
        await editCategory(data, id!);
        toast("Категорія успішно відредагована!");
      } else {
        await addCategory(data); // Виклик API для додавання категорії
        toast("Категорія успішно додана!");
      }
      form.reset(); // Очищення форми
      setIsOpen(false); // Закриття діалогу
    } catch (error) {
      console.error(error);
      toast("Щось пішло не так. Спробуйте ще раз.");
    }
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="" asChild>
          <Button onClick={() => setIsOpen(true)}>{title}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {edit ? (
                <span>Тут можна відредагувати категорію</span>
              ) : (
                <span>Тут можна додати нову категорію</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {edit ? (
                <span>Відредагуйте поля</span>
              ) : (
                <span>Заповніть поля і натисніть кнопку додати</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Форма НОВА */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3">
              {/* поле назва початок */}
              <FormField
                control={form.control}
                name="name"
                defaultValue={edit ? data?.name : ""}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Назва категорії</FormLabel>
                    <FormControl>
                      <Input placeholder="Назва" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* поле назва кінець */}
              {/* поле валюта початок */}
              <FormField
                control={form.control}
                name="categoryType"
                defaultValue={edit ? data?.categoryType : "SPENDING"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип категорії</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={edit ? data?.categoryType : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Виберіть тип" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                          <SelectItem value={'SPENDING'}><span className="text-red-500">Витрата</span></SelectItem>
                          <SelectItem value={'INCOME'}><span className="text-green-500">Дохід</span></SelectItem>                            
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{edit ? "Редагувати" : "Створити"}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserCategoryForm;

"use client";
import React, { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner"



const Confirm = ({
  id,
  fn,
  title,
  message,
  actionButtonTitle,
}: {
  title: string | ReactNode;
  id?: string;
  message: string;
  fn?: (id: string) => void;
  actionButtonTitle: string;
}) => {
  const [isOpen, setIsOpen] = useState(false); // Контроль видимості діалогу

  const handleAction = () => {
    if (fn && id) {
      try {
        fn(id);
        toast(message);
      } catch (error) {
        console.log(error);
        toast("Щось пішло не так. Спробуйте ще раз.");
      }
    }
    setIsOpen(false);
  };
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>{title}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ви точно впевнені?</DialogTitle>
            <DialogDescription>
              Ця дія є незворотньою, відновити документ не вдасться.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-evenly gap-2">
            <Button>Скасувати</Button>
            <Button className="bg-red-600" onClick={handleAction}>
              {actionButtonTitle}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Confirm;

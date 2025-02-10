import { TestCalendar } from "@/components/forms/TestCalendar";
import UserZvitByCategory from "@/components/forms/UserZvitByCategory";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { auth } from "../../../../auth";
import { prisma } from "../../../../prisma/prisma";

const ZvitPage = async () => {
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

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      defaultCurrency: true,
    },
  });
  return (
    <div>
        <div>
        <Separator />
        Звіт
        <UserZvitByCategory categories={categories} userSettings={userSettings}/>
      </div>
      <div className="">
        <Separator/>
        Тест календаря
        <TestCalendar />
      </div>
    </div>
  );
};

export default ZvitPage;

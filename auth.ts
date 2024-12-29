import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma/prisma";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      role: Role;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
  events:{
    async createUser({user}){
      if(user.id){
        await prisma.userSettings.create({
          data: {
            userId: user.id,
            // Додайте тут будь-які поля, які вам потрібні
          },
        });
      }
    }
  }
  // callbacks: {
  //   async signIn({user}) {
  //     return user
  //     // if (user.email) {
  //       // try {
  //       //   const existingUser = await prisma.user.findUnique({
  //       //     where: { email: user.email },
  //       //   });

  //       //   if (!existingUser) {
  //       //     // Якщо користувача немає, створюємо додаткові дані
  //       //     await prisma.userSettings.create({
  //       //       data: {
  //       //         userId: user.id,
  //       //         // Ваші початкові налаштування
  //       //       },
  //       //     });
  //       //     console.log("Додаткові дії виконані для нового користувача:", user);
  //       //   }

  //       //   return true; // Дозволяємо авторизацію
  //       // } catch (error) {
  //       //   console.error("Помилка при створенні додаткових даних:", error);
  //       //   return false; // Забороняємо авторизацію в разі помилки
  //       // }
  //     // }
  //   },
  // },
});

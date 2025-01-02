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
            defaultLanguage: "UA", // зараз тільки україна
            defaultCurrencyId: '676865fba7e2fdc9054fd700', // зараз тільки гривня
            defaultPeriod: 'MONTH',
          },
        });
        await prisma.category.create({
          data: {
            name: "Початкове внесення",
            categoryType: "INIT",
            userId: user.id,
          },
        });
      }
    }
  }
});

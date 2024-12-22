import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignIn from "@/components/sign-in";

const SignInPage = () => {
  return (
    <div className="flex h-screen justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Вхід</CardTitle>
          <CardDescription>Виберіть метод авторизації</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 w-full">
          <SignIn provider="github" providerAlias="GitHub" />
          <SignIn provider="google" providerAlias="Google" />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;

import SignIn from "@/components/sign-in";
import UserAvatar from "@/components/UserAvatar";
import { auth } from "../../auth";
import { SignOut } from "@/components/signout-button";

export default async function Home() {
  const session = await auth();
  
  return (
    <div className="">
      {session?.user ? (
        <>
          <UserAvatar />
          <SignOut />
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}

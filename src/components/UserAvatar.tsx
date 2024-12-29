import Image from "next/image";
import { auth } from "../../auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user) return null;


  return (
    <div className="flex items-center gap-2 bg-foreground text-background p-1 px-2 rounded-full ">
      <p className="">{session.user.email?.split("@")[0]}</p>
      <Image
      className="rounded-full "
        width={20}
        height={20}
        // src={'/icons/user.png'}
        src={session.user.image as string || '/icons/user.png'}
        alt="User Avatar"
      />
    </div>
  );
}

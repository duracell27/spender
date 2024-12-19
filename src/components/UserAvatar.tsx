import Image from "next/image";
import { auth } from "../../auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div>
      <p>{session.user.email}</p>
      <Image
        width={20}
        height={20}
        src={session.user.image as string}
        alt="User Avatar"
      />
    </div>
  );
}

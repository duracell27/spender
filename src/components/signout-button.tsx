import { signOut } from "../../auth"

 
export async function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({redirectTo: '/'})
      }}
    >
      <button type="submit" className="text-red-500">Вийти</button>
    </form>
  )
}
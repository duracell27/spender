import { signIn } from "../../auth"
import { Button } from "./ui/button"

 
export default function SignIn({provider, providerAlias}: {provider: string, providerAlias: string}) {
  return (
    <form
    className="w-full"
      action={async () => {
        "use server"
        await signIn(provider, {redirectTo: '/dashboard/transactions'})
      }}
    >
      <Button className="w-full" type="submit">{providerAlias}</Button>
    </form>
  )
} 
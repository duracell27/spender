"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
// import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,

  FormField,
  FormItem,

  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserSettings, Wallet } from "@prisma/client"
import { editUserSettings } from "@/actions/userSettings"

const ActiveWalletSchema = z.object({
    activeWalletId: z.string({
      required_error: "Виберіть гаманець",
    })
})

export type ActiveWalletSchema = z.infer<typeof ActiveWalletSchema>

export function  ActiveWalletSelect({wallets, userSettings}:{wallets: Wallet[], userSettings: UserSettings}) {

  const form = useForm<ActiveWalletSchema>({
    resolver: zodResolver(ActiveWalletSchema),
  })

  async function onSubmit(data: ActiveWalletSchema) {
    
    try {
        await editUserSettings(data, userSettings.id)
    } catch (error) {
        console.error(error)
    }
  }

  return (
    <div className="flex justify-end mb-4">

   
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <FormField
          control={form.control}
          name="activeWalletId"
          defaultValue={userSettings.activeWalletId}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={(value) => {
                  field.onChange(value) // Оновлює значення у формі
                  onSubmit({ activeWalletId: value }) // Викликає onSubmit
                }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {wallets.map((wallet, index) => (
                      <SelectItem key={index} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  <SelectItem key='all' value='all'>
                        Всі рахунки
                      </SelectItem>
                </SelectContent>
              </Select>
              
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
    </div>
  )
}

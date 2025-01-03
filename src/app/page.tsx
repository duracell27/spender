import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function Home() {
  return (
    <div className="flex flex-col gap-4 h-screen justify-center items-center">
      <p>Тут буде головна сторінка</p>

      <Dialog>
        <DialogTrigger asChild><Button>v 0.1</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оновлення по застосунку</DialogTitle>
            <DialogDescription>
              <strong className="">0.1 </strong><span>Вихід 1 версії бета</span>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

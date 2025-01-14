import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { devlog } from "@/lib/devlog";

export default async function Home() {
  return (
    <div className="flex flex-col gap-4 h-screen justify-center items-center">
      <p>Тут буде головна сторінка</p>

      <Dialog>
        <DialogTrigger asChild>
          <Button>v 0.14</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оновлення по застосунку</DialogTitle>
            <DialogDescription>
            {devlog.map((item, index) => (
                <span key={index} className="block">
                  <strong className="font-bold text-foreground">
                    {item.version}{" "}
                  </strong>
                  <span>{item.description}</span>
                </span>
              ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

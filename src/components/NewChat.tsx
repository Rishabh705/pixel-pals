import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BsSendPlusFill } from "react-icons/bs";
import { Input } from "@/components/ui/input"
import { CiSearch } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator";


export default function NewChat({ className }: { className?: string }) {
  const [searchText, setSearchText] = React.useState<string>("")

  return (
    <Sheet>
      <SheetTrigger className={cn(className)}>
        <BsSendPlusFill size={22} />
      </SheetTrigger>
      <SheetContent side='left' className="w-1/4 min-w-72 max-w-96 bg-secondary">
        <SheetHeader className='flex flex-col gap-4'>
          <div>
            <div className='flex gap-4 pr-6 h-full pt-2 pb-2'>
              <SheetTitle>New Chat</SheetTitle>
            </div>
            <Separator />
          </div>
        </SheetHeader>

        <section className='mt-4 flex flex-col gap-2'>
          <section className="flex">
            <span className="h-full flex items-center py-2.5 pl-2.5 rounded-l-full bg-background">
              <CiSearch size={20} color="#858687" />
            </span>
            <Input className="rounded-r-full border-none active:border-none bg-background" placeholder="Search a contact" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </section>

          <div className="py-4 px-4 bg-secondary flex items-center gap-4 rounded-xl hover:bg-background hover:cursor-pointer w-full">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-md font-semibold text-secondary-foreground">
                New Group
              </h2>
              <p className="text-xs font-medium text-secondary-foreground">
                Create a new group chat
              </p>
            </div>
          </div>
          <Separator />
        </section>

        <section className="mt-4 flex flex-col gap-2">

        </section>
      </SheetContent>
    </Sheet>
  )
}

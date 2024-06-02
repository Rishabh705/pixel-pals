import React, { Suspense } from "react";
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
import { Separator } from "@/components/ui/separator";
import { User } from "@/utils/types";
import { createChat } from "@/lib/api";
import { useAppSelector } from "@/rtk/hooks";
import { useNavigate, Await, Form, } from "react-router-dom";
import CustomCard from "./CustomCard";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BiSolidError } from "react-icons/bi"
import { Label } from "@/components/ui/label"
import { Skeleton } from "./ui/skeleton";

export default function NewChat({ contacts, error, className }: { contacts: any, error: string, className?: string }) {
  const [searchText, setSearchText] = React.useState<string>("")
  const token = useAppSelector((state) => state.auth.token)
  const navigate = useNavigate()

  const createOneonOneChat = async (contact: User) => {
    if (!token) throw new Error("User not authenticated.")
    const res = await createChat(token, contact._id)
    navigate(`/chats/${res._id}?re=${contact._id}&&name=${contact.username}`)
  }

  const renderContacts = (contacts: User[]) => {

    const contactCard: JSX.Element[] = contacts
      .filter((contact: User) => contact.username.toLowerCase().includes(searchText.toLowerCase()))
      .map((contact: User) => {
        return (
          <div key={contact._id} className="space-y-2">
            <div className="p-4 bg-secondary flex items-center gap-2 rounded-xl hover:bg-background hover:cursor-pointer w-full" onClick={() => createOneonOneChat(contact)}>
              <CustomCard avatarImg={contact.avatar} avatarFallback={contact.username} title={contact.username} subtitle="Status" />
            </div>
            <Separator />
          </div>
        )
      })

    return (
      <>
        <p className="px-4 text-md text-secondary-foreground font-medium">My Contacts</p>
        {contactCard }
      </>
    );

  }

  return (
    <Sheet>
      <SheetTrigger className={cn(className)}>
        <BsSendPlusFill size={22} />
      </SheetTrigger>
      <SheetContent side='left' className="w-1/4 min-w-72 max-w-96 bg-secondary p-2">
        <SheetHeader className='flex flex-col gap-4'>
          <div>
            <div className='flex gap-4  px-4 pr-6 h-full pt-2 pb-2'>
              <SheetTitle>New Chat</SheetTitle>
            </div>
            <Separator />
          </div>
        </SheetHeader>

        <section className='mt-4 flex flex-col gap-2'>
          <section className="flex px-4">
            <span className="h-full flex items-center py-2.5 pl-2.5 rounded-l-full bg-background">
              <CiSearch size={20} color="#858687" />
            </span>
            <Input className="rounded-r-full border-none active:border-none bg-background" placeholder="Search a contact" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </section>

          <div className="py-4 px-4 bg-secondary flex items-center gap-4 rounded-xl hover:bg-background hover:cursor-pointer w-full">
            <CustomCard avatarImg="https://github.com/shadcn.png" avatarFallback="CN" title="New Group" subtitle="Create a new group chat" />
          </div>
          <Separator />
        </section>

        <section className="mt-2 flex flex-col gap-2">
          <Suspense fallback={
            <>
              {
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="py-4 px-4 bg-card flex items-center gap-4 rounded-xl hover:bg-secondary hover:cursor-pointer">
                    <Skeleton className="rounded-full p-5" />
                    <div className="space-y-2">
                      <Skeleton className="p-1 w-[200px]" />
                      <Skeleton className="p-1 w-[250px]" />
                      <Skeleton className="p-1 w-[150px]" />
                    </div>
                  </div>
                ))
              }
            </>
          }>
            <Await resolve={contacts}>
              {renderContacts}
            </Await>
          </Suspense>
          <AddContactDialog error={error} />
        </section>

      </SheetContent>
    </Sheet>
  )
}

function AddContactDialog({ error }: { error: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="py-4 px-4 bg-secondary flex items-center gap-4 rounded-xl hover:bg-background hover:cursor-pointer w-full">
          <CustomCard avatarImg="https://github.com/shadcn.png" avatarFallback="CN" title="Add new contact" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form method="post" action="/chats">
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>
              Enter contact name here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input name="contactName" className="col-span-3" />
            </div>
            {error && (
              <div className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                <BiSolidError className="h-5 w-5 text-red-600" />
                <p className="text-sm leading-5 text-red-600">{error}</p>
              </div>
            )}        </div>
          <DialogFooter>
            <DialogTrigger>
              <Button type="submit">Add</Button>
            </DialogTrigger>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
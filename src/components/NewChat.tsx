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

import { createChat, getPublicKey } from "@/lib/api";
import { useAppSelector } from "@/rtk/hooks";
import { useNavigate, Await } from "react-router-dom";
import CustomCard from "./CustomCard";
import { Skeleton } from "./ui/skeleton";
import { AddGroup } from "./AddGroup";
import AddContact from "./AddContact";
import { getKey } from "@/lib/helpers";


export default function NewChat({ contacts, error, className }: { contacts: any, error:  {message:string, success:boolean}, className?: string }) {
  const [searchText, setSearchText] = React.useState<string>("")
  const [open, setOpen] = React.useState<boolean>(false)
  const token = useAppSelector((state) => state.auth.accessToken)
  const navigate = useNavigate()
  const userId: string|null = useAppSelector((state) => state.auth.userId)

  const createOneonOneChat = async (contact: User) => {
    if (!token || !userId) throw new Error("User not authenticated.");
    
    if (!contact.email) {
      throw new Error("Email of receiver is missing.");
    }
    // Fetch sender public key from IndexedDB AND receiver public key from server in parallel
    const [senderPublicKey, recieverPublicKey] = await Promise.all([
        getKey("publicKey"),
        getPublicKey(contact.email, token)
    ]);

    if (!senderPublicKey) throw new Error("Sender public key not found");
    if (!recieverPublicKey) throw new Error("Receiver public key not found");

    // Prepare members keys
    const membersKeys = new Map<string, string>();
    membersKeys.set(contact._id, recieverPublicKey);
    membersKeys.set(userId, senderPublicKey);

    // Create chat
    const res = await createChat(token, contact._id, membersKeys);
    setOpen(false);
    navigate(`/chats/${res._id}?re=${contact._id}&name=${contact.username}&type=individual`);
};


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
        <p className="text-md text-secondary-foreground font-medium">My Contacts</p>

        {contactCard}

      </>
    );

  }

  return (
    <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
      <SheetTrigger className={cn(className)}>
        <BsSendPlusFill size={22} />
      </SheetTrigger>
      <SheetContent side='left' className="w-screen lg:w-1/3 lg:min-w-72 bg-secondary lg:p-4">
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

          <AddGroup error={error} contacts={contacts} />

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

          <AddContact error={error} />

        </section>

      </SheetContent>
    </Sheet>
  )
}


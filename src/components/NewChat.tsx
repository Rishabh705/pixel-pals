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

import { addGroup, createChat } from "@/lib/api";
import { useAppSelector } from "@/rtk/hooks";
import { useNavigate, Await, Form, useNavigation, Navigation } from "react-router-dom";
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

import { socket } from '@/lib/socket'


export default function NewChat({ contacts, error, className }: { contacts: any, error: string, className?: string }) {
  const [searchText, setSearchText] = React.useState<string>("")
  const token = useAppSelector((state) => state.auth.token)
  const navigate = useNavigate()

  const createOneonOneChat = async (contact: User) => {

    if (!token) throw new Error("User not authenticated.");
    const res = await createChat(token, contact._id);
    navigate(`/chats/${res._id}?re=${contact._id}&&name=${contact.username}`);

    // Emit socket event to join individual chat room
    socket.emit("join-chat", res._id);
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
    <Sheet>
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

          <AddGroupDialog error={error} contacts={contacts} />

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
  const status: Navigation = useNavigation()

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

              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input name="email" className="col-span-3" />

            </div>
            {error && (
              <div className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                <BiSolidError className="h-5 w-5 text-red-600" />
                <p className="text-sm leading-5 text-red-600">{error}</p>
              </div>

            )}
          </div>
          <DialogFooter>
            <Button type="submit" name="intent" value='create-contact' disabled={status.state === "submitting"}
              className={`${status.state !== "submitting" && "hover:bg-orange-600 cursor-pointer"} ${status.state === "submitting" && "opacity-40"}`}
            >
              {status.state === "submitting" ? "Submitting..." : "Submit"}
            </Button>

          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface GroupFormData {
  name: string;
  description: string;
  members: string[];
}

function AddGroupDialog({ error, contacts }: { error: string, contacts: any }) {
  const [searchText, setSearchText] = React.useState<string>("");
  const [formData, setFormData] = React.useState<GroupFormData>({
    name: '',
    description: '',
    members: []
  });
  const token = useAppSelector((state) => state.auth.token);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const contactId = value;
      setFormData((prev: GroupFormData) => ({
        ...prev,
        members: prev.members.includes(contactId)
          ? prev.members.filter((id) => id !== contactId)
          : [...prev.members, contactId]
      }));
    }
    else {
      setFormData((prev: GroupFormData) => ({
        ...prev,
        [name]: value
      })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!token) throw new Error("User not authenticated.");
      const res = await addGroup(token, formData.name, formData.description, formData.members);
      console.log("Group created", res);

    } catch (error: any) {
      console.log("Error creating group", error.message);
    }
  };

  const renderContacts = (contacts: User[]) => {
    const contactCard: JSX.Element[] = contacts
      .filter((contact: User) => contact.username.toLowerCase().includes(searchText.toLowerCase()))
      .map((contact: User) => {
        return (
          <div key={contact._id} className="space-y-2">
            <div className="p-4 bg-secondary flex items-center gap-2 rounded-xl hover:bg-background w-full">
              <input
                type="checkbox"
                name="members"
                value={contact._id}
                checked={formData.members.includes(contact._id)}
                onChange={handleInputChange}
              />
              <CustomCard avatarImg={contact.avatar} avatarFallback={contact.username} title={contact.username} subtitle="Status" />
            </div>
            <Separator />
          </div>
        );
      });

    return (
      <>
        <p className="text-md text-secondary-foreground font-medium pb-2">My Contacts</p>
        <Input name="search" className="col-span-3" placeholder="Search Contact" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <div className="h-60 overflow-y-scroll">
          {contactCard}
        </div>
      </>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="py-4 px-4 bg-secondary flex items-center gap-4 rounded-xl hover:bg-background hover:cursor-pointer w-full">
          <CustomCard avatarImg="https://github.com/shadcn.png" avatarFallback="CN" title="New Group" subtitle="Create a new group chat" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
            <DialogDescription>
              Select the members from below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input name="name" className="col-span-3" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input name="description" className="col-span-3" value={formData.description} onChange={handleInputChange} />
            </div>

            <section className="mt-2 flex flex-col gap-2">
              <Suspense fallback={
                <>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="py-4 px-4 bg-card flex items-center gap-4 rounded-xl hover:bg-secondary hover:cursor-pointer">
                      <Skeleton className="rounded-full p-5" />
                      <div className="space-y-2">
                        <Skeleton className="p-1 w-[200px]" />
                        <Skeleton className="p-1 w-[250px]" />
                        <Skeleton className="p-1 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </>
              }>
                <Await resolve={contacts}>
                  {renderContacts}
                </Await>
              </Suspense>
            </section>

            {error && (
              <div className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                <BiSolidError className="h-5 w-5 text-red-600" />
                <p className="text-sm leading-5 text-red-600">{error}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" name="intent" value="create-group">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


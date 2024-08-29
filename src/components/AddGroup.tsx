import React, { Suspense } from "react";
import { BiSolidError } from "react-icons/bi";
import { useNavigation, Await, Navigation, Form } from "react-router-dom";
import { User } from "@/utils/types";
import CustomCard from "./CustomCard";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "./ui/label";
import { Button } from "./ui/button";


export function AddGroup({ error, contacts }: { error: {message:string, success:boolean}, contacts: any }) {
    const [searchText, setSearchText] = React.useState<string>("");
    const [members, setMembers] = React.useState<string[]>([]);
    const status: Navigation = useNavigation();


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;

        setMembers((prev) => {
            if (checked) {
                return [...prev, value]; // Add contact ID if checked
            } else {
                return prev.filter((id) => id !== value); // Remove contact ID if unchecked
            }
        });
    }

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
                                checked={members.includes(contact._id)}
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
                <Form action="/chats" method="post">
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
                            <Input name="name" className="col-span-3" required />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input name="description" className="col-span-3" />
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

                        {error && !error.success && (
                            <div className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                                <BiSolidError className="h-5 w-5 text-red-600" />
                                <p className="text-sm leading-5 text-red-600">{error.message}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" name="intent" value='create-group' disabled={status.state === "submitting"}
                            className={`${status.state !== "submitting" && "hover:bg-orange-600 cursor-pointer"} ${status.state === "submitting" && "opacity-40"}`}
                        >
                            {status.state === "submitting" ? "Submitting..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

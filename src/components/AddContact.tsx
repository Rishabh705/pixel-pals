import { useEffect, useState } from "react";
import { BiSolidError } from "react-icons/bi";
import { useNavigation, Navigation, Form, useActionData } from "react-router-dom";
import CustomCard from "./CustomCard";
import { Input } from "./ui/input";
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


export default function AddContact({ error }: { error:  {message:string, success:boolean} }) {
    const status: Navigation = useNavigation()
    const [open, setOpen] = useState<boolean>(false)
    const actionData: any = useActionData()

    useEffect(() => {
        if (status.state === "submitting" && actionData) {
            if (actionData.success) {
                setOpen(false)
            }
        }
    }, [status.state, actionData])

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}> 
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
                        {error && !error.success && (
                            <div className="flex gap-4 p-2.5 bg-red-200 rounded-md">
                                <BiSolidError className="h-5 w-5 text-red-600" />
                                <p className="text-sm leading-5 text-red-600">{error.message}</p>
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

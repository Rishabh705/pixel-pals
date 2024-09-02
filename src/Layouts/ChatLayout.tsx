import { useEffect } from "react";
import { Outlet, defer, useLoaderData, useActionData } from "react-router-dom"
import { store } from "@/rtk/store";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { addContact, getChats, getContacts, addGroup } from "@/lib/api";
import { requireAuth } from "@/lib/requireAuth";
import { SocketMessage } from "@/utils/types";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";
import { socket } from "@/lib/socket";
import ChatSheet from "@/components/ChatSheet";
import { GiHamburgerMenu } from "react-icons/gi";
import '../styles/chatlayout.css'
import { setCloseSheets } from "@/rtk/slices/closeSheets";

export async function loader({ request }: { request: Request }) {
    // console.log("chatlayout loader..");

    await requireAuth(request)
    const userId: (string | null) = store.getState().auth.userId
    const token: (string | null) = store.getState().auth.accessToken

    if (userId === null || token === null) return { data: [] }

    const data = getChats(userId, token)
    const contacts = getContacts(userId, token)


    return defer({ data: data, contacts: contacts })

}

export async function action({ request }: { request: Request }) {
    // console.log("chatlayout action..");

    try {
        const form: FormData = await request.formData()
        const token: (string | null) = store.getState().auth.accessToken

        if (!token) throw new Error("User not authenticated.")


        const intent: string = form.get('intent')?.toString() || ''

        if (intent === 'create-contact') {
            const email: string = form.get('email')?.toString() || ''
            await addContact(token, email)
            return { message: "Action Completed", success: true }
        }

        if (intent === 'create-group') {
            const name = form.get('name')?.toString() || ''
            const description = form.get('description')?.toString() || ''
            const members = form.getAll('members') || []
            await addGroup(token, name, description, members);
        }
        return { message: "Action Completed", success: true }

    } catch (error: any) {
        const contact = error.message.includes('contact')
        const group = error.message.includes('group')
        return { message: error.message, success: false, group: group, contact: contact }
    }

}

export default function ChatLayout() {
    const data: any = useLoaderData()
    const error: any = useActionData()
    const dispatch = useAppDispatch()
    const userId:string|null = useAppSelector((state) => state.auth.userId)
    const closeSheets:boolean = useAppSelector((state)=>state.closeSheets)

    useEffect(() => {

        if (userId) {
            socket.emit('register-user', userId);
        }

        console.log(userId);
        

        const handleMessage = (data: SocketMessage) => {
            dispatch(setSocketMsg(data));
        };

        const elem: (Element | null) = document.querySelector('.data');
        if (elem) {
            elem.scrollTop = elem.scrollHeight;
        }

        socket.on('receive-message', handleMessage);

        return () => {
            socket.off('receive-message', handleMessage);
        };
    }, [dispatch]);

    return (
        <div className="flex h-screen border-b-2">
            <Sheet open={closeSheets} onOpenChange={(open)=>dispatch(setCloseSheets(open))}>
                <SheetTrigger className='flex lg:hidden absolute left-3 top-6'>
                    <GiHamburgerMenu color='#1a1a1a' size={30} />
                </SheetTrigger>
                <SheetContent side='left' className="bg-secondary w-screen">
                    <ChatSheet error={error} data={data} />
                </SheetContent>
            </Sheet>

            <ChatSheet error={error} data={data} className='hidden' />

            <Outlet />
        </div>
    )
}

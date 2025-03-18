import { useEffect } from "react";
import { Outlet, defer, useLoaderData, useActionData } from "react-router-dom"
import { store } from "@/rtk/store";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { addContact, getChats, getContacts, addGroup, getPublicKey } from "@/lib/api";
import { requireAuth } from "@/lib/requireAuth";
import { SocketMessage } from "@/utils/types";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setSocketMsg } from "@/rtk/slices/socketMsgSlice";
import { socket } from "@/lib/socket";
import ChatSheet from "@/components/ChatSheet";
import { GiHamburgerMenu } from "react-icons/gi";
import '../styles/chatlayout.css'
import { setCloseSheets } from "@/rtk/slices/closeSheets";
import { encryptSymmetricKey, getKey } from "@/lib/helpers";

export async function loader({ request }: { request: Request }) {
    // console.log("chatlayout loader..");

    await requireAuth(request)
    const userId: (string | null) = store.getState().auth.userId
    const token: (string | null) = store.getState().auth.accessToken

    if (userId === null || token === null) {
        throw {
            message: "Invalid Session. Please login again",
            statusText: "Unauthorized",
            status: 401
        }
    }

    const data = getChats(token)
    const contacts = getContacts(token)

    socket.emit('register-user', userId);

    return defer({ data: data, contacts: contacts })

}

export async function action({ request }: { request: Request }) {

    try {
        const form: FormData = await request.formData()
        const token: (string | null) = store.getState().auth.accessToken

        if (!token)
            throw {
                message: "You are not authenticated. Please login",
                statusText: "Unauthorized",
                status: 401,
            };


        const intent: string | undefined = form.get('intent')?.toString()

        if (!intent)
            throw {
                message: "Something went wrong. Please try again",
                statusText: "Bad Request",
                status: 400,
            };

        if (intent === 'create-contact') {
            const email: string | undefined = form.get('email')?.toString()

            if (!email)
                throw new Error("Please fill in all the fields")

            await addContact(token, email)
            return { message: "Action Completed", success: true }
        }

        if (intent === 'create-group') {
            const name: string | undefined = form.get('name')?.toString()
            const description: string | undefined = form.get('description')?.toString()
            const userId: string | null = store.getState().auth.userId;
            if(!userId){
                throw new Error("Session expired. Please login again.")
            }

            if (!name || !description) {
                throw new Error("Please fill in all the fields")
            }

            const members: FormDataEntryValue[] = form.getAll('members')

            if (members.length === 0) {
                throw new Error("Please add at least one member")
            }
            const membersKeys = new Map<string, string>();
            const senderPublicKey:string = await getKey("publicKey");
            membersKeys.set(userId, senderPublicKey);
            // We'll collect IDs in this array
            const memberIds: string[] = [];

            const publicKeyPromises = members.map(async (member) => {
                // Parse JSON string
                const memberObj = JSON.parse(member.toString()); // { id, email }

                const publicKey = await getPublicKey(memberObj.email, token);
                if (!publicKey) {
                    throw new Error(`Public key for ${memberObj.email} not found`);
                }

                membersKeys.set(memberObj.id, publicKey);
                memberIds.push(memberObj.id); // Collect ID here

                return { memberId: memberObj.id, email: memberObj.email, publicKey };
            });

            await Promise.all(publicKeyPromises);

            const { encryptedAESKeys } = await encryptSymmetricKey(membersKeys);

            await addGroup(token, name, description, memberIds, encryptedAESKeys);

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
    const closeSheets: boolean = useAppSelector((state) => state.closeSheets)

    useEffect(() => {

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
            <Sheet open={closeSheets} onOpenChange={(open) => dispatch(setCloseSheets(open))}>
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

import { store } from "@/rtk/store";
import { addContact, addGroup, getPublicKey } from "@/lib/api";
import { encryptSymmetricKey, getKey } from "@/lib/helpers";
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
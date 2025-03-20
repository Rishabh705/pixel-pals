import { ChatDetailsResponse, LoginResponse, RegisterResponse, SendMessageResponse, User, UserChatsResponse } from '@/utils/types';
import { cryptoKeyToBase64, encryptSymmetricKey } from './helpers';
import { AuthenticatedFetch } from './jwt';

// fetch search results
const url = import.meta.env.VITE_SERVER

//authentication

export async function loginUser(formdata: { email: (FormDataEntryValue | null), password: (FormDataEntryValue | null) }): Promise<LoginResponse> {
    const res: Response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formdata)
    })

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to login. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function registerUser(
    formdata: {
        username: string,
        email: string,
        password: string,
        publicKey: CryptoKey,
    }
): Promise<RegisterResponse> {

    const publicKeyBase64: string = await cryptoKeyToBase64(formdata.publicKey);

    const res: Response = await fetch(`${url}/api/auth/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...formdata,
            publicKey: publicKeyBase64,  // don't encrypt public key
        })
    })

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to register. Please Try agian.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function logoutUser(): Promise<{ message: string }> {
    const res: Response = await fetch(`${url}/api/auth/logout`, {
        credentials: 'include'
    });

    if (!res.ok) {
        throw {
            message: "Failed to logout",
            statusText: res.statusText,
            status: res.status,
        };
    }

    return { message: "Logged out" };
}


export async function getPublicKey(email: string, token: string): Promise<string> {

    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/auth/public-key?email=${email}`, options, token)

    const data = await res.json()
    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to fetch your chats. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data.publicKey
}

//chats
export async function getChats(token: string): Promise<UserChatsResponse> {

    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to fetch your chats. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function getChat(chatID: string, token: string): Promise<ChatDetailsResponse> {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    const res: Response = await AuthenticatedFetch(`${url}/api/chats/${chatID}`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to fetch this chat. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function createChat(token: string, receiverID: string, publicKeysBase64Map: Map<string, string>): Promise<{_id:string}> {
    const { encryptedAESKeys } = await encryptSymmetricKey(publicKeysBase64Map);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            receiverID: receiverID,
            aesKeys: Object.fromEntries(encryptedAESKeys),
        })
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats/one-on-one`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to create chat. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}


export async function addContact(token: string, email: string): Promise<User[]> {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            email: email
        })
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/contacts`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to create contact. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}

export async function getContacts(token: string): Promise<User[]> {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/contacts`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to fecth your contacts. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}


export async function sendMessage(message: string, token: string, messageID: string, chatID?: string): Promise<SendMessageResponse> {

    let method = 'POST'

    if (chatID) {
        method = "PUT"
    }

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            message: message,
            messageID: messageID
        })
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats/${chatID}`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to send message. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data

}

export async function addGroup(token: string, name: string, description: string, members: FormDataEntryValue[], encryptedAESKeys: Map<string, string>): Promise<{_id:string}> {

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            description: description,
            members: members,
            aesKeys: Object.fromEntries(encryptedAESKeys),
        })
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats/group`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.error.message || "Failed to create group. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }
    console.log(data);
    return data
}


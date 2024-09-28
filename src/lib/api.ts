import { encryptKey, uint8ArrayToBase64 } from './helpers';
import { AuthenticatedFetch } from './jwt';

// fetch search results
const url = import.meta.env.VITE_SERVER

//authentication

export async function loginUser(formdata: { email: (FormDataEntryValue | null), password: (FormDataEntryValue | null) }): Promise<any> {
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
            message: data.message || "Failed to login. Please Try again.",
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
        privateKey: CryptoKey,
    }
): Promise<any> {

    const encryptedPrivateKey64: string = await encryptKey(formdata.privateKey); //WORKING
    const exportedPublicKey: ArrayBuffer = await crypto.subtle.exportKey('spki', formdata.publicKey);

    const publicKeyArrayBuffer: Uint8Array = new Uint8Array(exportedPublicKey);

    // Convert ArrayBuffer to base64 for JSON serialization
    const publicKeyBase64: string = uint8ArrayToBase64(publicKeyArrayBuffer);

    const res: Response = await fetch(`${url}/api/auth/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...formdata,
            data1: publicKeyBase64,  // don't encrypted public key
            data2: encryptedPrivateKey64  // Encrypted private key
        })
    })

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to register. Please Try agian.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function logoutUser(): Promise<any> {
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

//chats
export async function getChats(userID: string, token: string): Promise<any> {

    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats?userID=${userID}`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to fetch your chats. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function getChat(chatID: string, token: string): Promise<any> {
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
            message: data.message || "Failed to fetch this chat. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function createChat(token: string, receiverID: string): Promise<any> {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            receiverID: receiverID
        })
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats/one-on-one`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to create chat. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}


export async function addContact(token: string, email: string): Promise<any> {
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
            message: data.message || "Failed to create contact. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}

export async function getContacts(userID: string, token: string): Promise<any> {
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/contacts?userId=${userID}`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to fecth your contacts. Refresh the page",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}


export async function sendMessage(message: string, token: string, messageID: string, chatID?: string): Promise<any> {

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
            message: data.message || "Failed to send message. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data

}

export async function addGroup(token: string, name: string, description: string, members: FormDataEntryValue[]): Promise<any> {

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
        })
    }
    const res: Response = await AuthenticatedFetch(`${url}/api/chats/group`, options, token)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to create group. Please Try again.",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}


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
            message: data.detail || "Failed to login",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}


export async function registerUser(formdata: { username: string, email:string, password: string }): Promise<any> {

    const res: Response = await fetch(`${url}/api/auth/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formdata)
    })

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to register",
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
    const res: Response = await fetch(`${url}/api/chats?userID=${userID}`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to get chats",
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

    const res: Response = await fetch(`${url}/api/chats/${chatID}`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to get chat",
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
    const res: Response = await fetch(`${url}/api/chats/one-on-one`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to create chat",
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
    const res: Response = await fetch(`${url}/api/contacts`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to create contact",
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
    const res: Response = await fetch(`${url}/api/contacts?userId=${userID}`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to get contacts",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data.data
}


export async function sendMessage(message: string, token: string, messageID:string, chatID?: string): Promise<any> {

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
    const res: Response = await fetch(`${url}/api/chats/${chatID}`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to send message",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data

}

export async function addGroup(token:string, name: string, description:string, members: FormDataEntryValue[]): Promise<any> {


    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            description: description,
            members: members
        })
    }
    const res: Response = await fetch(`${url}/api/chats/group`, options)

    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message || "Failed to create group",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}


// fetch search results
const url = import.meta.env.VITE_SERVER

//authentication

export async function loginUser(formdata: { username: string, password: string }) {
    const res = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formdata)
    })

    const data = await res.json() //access, refresh

    if (!res.ok) {
        throw {
            message: data.detail || "Failed to login",
            statusText: res.statusText,
            status: res.status,
        }
    }

    return data
}

export async function registerUser(formdata: { username: string, password: string }) {
    const res = await fetch(`${url}/api/auth/register/`, {
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
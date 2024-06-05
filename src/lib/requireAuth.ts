import { redirect } from "react-router-dom"
import { store } from "@/rtk/store"

export async function requireAuth(request: Request) {

    const token:(string|null) = store.getState().auth.token

    const isLoggedIn: boolean = token!==null

    const pathname:string = new URL(request.url).pathname
    
    if (!isLoggedIn) {
        throw redirect(`/login?message=You must be logged in to view this page&redirectTo=${pathname}`)
    }
    return null
}
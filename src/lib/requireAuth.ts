import { redirect } from "react-router-dom"
import { store } from "@/rtk/store"
import { AuthState } from "@/utils/types"
import { login } from "@/rtk/slices/authSlice"

export async function requireAuth(request: Request) {

    let token:(string|null) = store.getState().auth.accessToken
    const localstorage = localStorage.getItem('loggedin')

    if (localstorage) {
        const authData: AuthState = JSON.parse(localstorage);
        
        // If the token in Redux state is null, use the one from local storage
        if (!token && authData.accessToken) {
            token = authData.accessToken;
            store.dispatch(login(authData))
        }
    }

    const isLoggedIn: boolean = token!==null

    const pathname:string = new URL(request.url).pathname
    
    if (!isLoggedIn) {
        throw redirect(`/login?message=You must be logged in to view this page&redirectTo=${pathname}`)
    }
    return null
}
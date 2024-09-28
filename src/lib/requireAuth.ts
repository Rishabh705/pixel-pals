import { redirect } from "react-router-dom";
import { store } from "@/rtk/store";
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";
import { isTokenExpired, refreshToken } from "./jwt";
import {jwtDecode} from "jwt-decode"; // Fixed import of jwtDecode

export async function requireAuth(request: Request) {
    // Get the token from Redux store
    let token: string | null = store.getState().auth.accessToken;
    
    // Get any locally stored auth data
    const localstorage = localStorage.getItem("loggedin");
    const pathname: string = new URL(request.url).pathname;

    // Check if user data exists in local storage (fallback when Redux state is lost)
    if (localstorage) {
        const authData: AuthState = JSON.parse(localstorage);

        // If the token in Redux state is null, use the one from localStorage
        if (!token && authData.accessToken) {
            token = authData.accessToken;
            store.dispatch(login(authData)); // Set the auth data in Redux store
        }
    }

    // Check if the token exists and if it's expired
    if (token && isTokenExpired(token)) {
        try {
            // Try refreshing the token
            const newAccessToken: string | null = await refreshToken(pathname); // Fetch new access token
            if (newAccessToken) {
                // Decode the new token and update the state with refreshed data
                const decoded: JWTPayload = jwtDecode(newAccessToken);
                
                // Ensure the decoded token structure is accurate
                const authData: AuthState = {
                    userId: decoded.UserInfo._id,  // Ensure the structure matches your JWT payload
                    email: decoded.UserInfo.email,
                    username: decoded.UserInfo.username,
                    accessToken: newAccessToken,
                };

                // Update Redux store and localStorage
                store.dispatch(login(authData)); 
                localStorage.setItem('loggedin', JSON.stringify(authData));
                
                token = newAccessToken; // Set token to the new one
            } else {
                throw new Error("Failed to refresh token");
            }
        } catch (error) {
            console.error("Failed to refresh token:", error);
            // Redirect the user to the login page in case of refresh failure
            throw redirect(`/login?message=Session expired, please log in again&redirectTo=${pathname}`);
        }
    }

    // Check if the user is still logged in after token refresh or validation
    const isLoggedIn: boolean = token !== null && !isTokenExpired(token);
    
    // If user is not logged in, redirect to login page
    if (!isLoggedIn) {
        throw redirect(`/login?message=You must be logged in to view this page&redirectTo=${pathname}`);
    }

    // Return null if the authentication passes
    return null;
}

import { jwtDecode } from "jwt-decode";
import { store } from "@/rtk/store";
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";

const url = import.meta.env.VITE_SERVER;

// Helper function to decode JWT and check for token expiration
export function isTokenExpired(token: string): boolean {
    try {
        const decodedToken: { exp: number } = jwtDecode(token);

        // Convert expiration time from seconds to milliseconds and compare with the current time
        const currentTime = Date.now() / 1000; // Current time in seconds
        return decodedToken.exp < currentTime;
    } catch (e) {
        console.error("Error decoding token:", e);
        return true; // If decoding fails, consider the token expired
    }
}

// Helper function to get cookie value
export const refreshToken = async (pathname: string) => {
    try {
        const response = await fetch(`${url}/refresh`, {
            method: 'GET',
            credentials: 'include',  // Include cookies with the request
        });

        if (!response.ok) {
            throw new Error('Session expired. Please log in again.');  // Throw an error if the refresh request fails
        }

        const { accessToken } = await response.json();
        return accessToken;  // Use the new access token
    } catch (error: any) {
        console.error('Failed to refresh token:', error);
        window.location.href = `/login?message=${error.message}&redirectTo=${pathname}`;
    }
};

export async function AuthenticatedFetch(endpoint: string, options: RequestInit, token: string): Promise<any> {
    // Retrieve the current access token from Redux store
    let accessToken: string = token;

    // Check if the token is expired
    if (accessToken && isTokenExpired(accessToken)) {
        // Refresh the token if it's expired
        const pathname = window.location.pathname;
        const queryparams = window.location.search;
        const redirectUrl = encodeURIComponent(pathname + queryparams);

        const newAccessToken: string | null = await refreshToken(redirectUrl);
        
        if (newAccessToken) {
            // Decode the new access token
            const decoded: JWTPayload = jwtDecode(newAccessToken);
            
            // Update the auth data with the new token
            const updatedAuthData: AuthState = {
                userId: decoded.UserInfo._id,
                email: decoded.UserInfo.email,
                username: decoded.UserInfo.username,
                accessToken: newAccessToken,
            };

            // Update Redux store and local storage with the new access token
            store.dispatch(login(updatedAuthData));
            localStorage.setItem("loggedin", JSON.stringify(updatedAuthData));
            
            // Set the updated access token
            accessToken = newAccessToken;
        } else {
            // If token refresh failed, redirect to login
            window.location.href = `/login?message=Session Expired. Please Login again&redirectTo=${redirectUrl}`;
            return;
        }
    }

    // Add Authorization header with the current or updated access token
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    // Make the fetch request with the updated headers
    const response = await fetch(endpoint, { ...options, headers });

    return response;
}
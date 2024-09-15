import { jwtDecode } from "jwt-decode";
const url = import.meta.env.VITE_SERVER
import { store } from "@/rtk/store";
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";


// Generate a random AES key
export async function generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt message
export async function encryptMessage(message: string, key: CryptoKey): Promise<{ iv: string, encryptedMessage: string }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Generate a random initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM uses a 12-byte IV
    
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        data
    );
    
    // Convert buffers to base64
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const encryptedMessage = btoa(String.fromCharCode(...encryptedArray));
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
        iv: ivHex,
        encryptedMessage
    };
}

// Decrypt message
export async function decryptMessage(encryptedMessage: string, ivHex: string, key: CryptoKey): Promise<string> {
    const encryptedArray = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const iv = Uint8Array.from(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        encryptedArray
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}


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
    } catch (error:any) {
        console.error('Failed to refresh token:', error);
        window.location.href = `/login?message=${error.message}&redirectTo=${pathname}`;
    }
};

export async function AuthenticatedFetch(endpoint: string, options: RequestInit, token:string): Promise<any> {
    // Retrieve the current access token from Redux store
    let accessToken:string = token;

    // Check if the token is expired
    if (accessToken && isTokenExpired(accessToken)) {
        // Refresh the token if it's expired
        const newAccessToken: string | null = await refreshToken(window.location.pathname);
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
            window.location.href = `/login?message=Session Expired. Please Login again&redirectTo=${window.location.pathname}`;
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
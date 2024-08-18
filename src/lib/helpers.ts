import { login } from "@/rtk/slices/authSlice";
import { store } from "@/rtk/store";
import { AuthState, JWTPayload } from "@/utils/types";
import { jwtDecode } from "jwt-decode";



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

// Helper function to refresh access token
export async function refreshAccessToken(url: string): Promise<string | null> {
    try {
        const res: Response = await fetch(`${url}/refresh`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (!res.ok) {
            throw new Error('Failed to refresh token');
        }

        const data: { accessToken: string } = await res.json();
        const newAccessToken: string = data.accessToken;

        //decode the token
        const decoded: JWTPayload = jwtDecode(newAccessToken)

        const authData: AuthState = {
            userId: decoded.UserInfo._id,
            email: decoded.UserInfo.email,
            username: decoded.UserInfo.username,
            accessToken: newAccessToken,
        }

        //store the data in the store
        store.dispatch(login(authData))
        localStorage.setItem("loggedin", JSON.stringify(authData))

        return newAccessToken;
    } catch (error) {
        // console.error('Error refreshing access token:', error);
        return null;
    }
}

// Wrapper function to handle token refreshing
export async function fetchWithAuth(url: string, endpoint: string, options: RequestInit): Promise<Response> {
    options.credentials = 'include';

    let res: Response = await fetch(`${url}${endpoint}`, options);

    if (res.status === 403) { // Token might have expired
        const newAccessToken = await refreshAccessToken(url);
        if (newAccessToken) {
            // Retry with the new access token
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${newAccessToken}`,
            };
            res = await fetch(`${url}${endpoint}`, options);
        } else {
            // Handle refresh failure (e.g., log out the user)
            // console.error('Failed to refresh token. Redirecting to login.');
            localStorage.removeItem("loggedin")
            window.location.href = '/login?message=Session expired. Please log in again.';
        }
    }

    return res;
}

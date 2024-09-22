import { jwtDecode } from "jwt-decode";
import { store } from "@/rtk/store";
import { AuthState, JWTPayload } from "@/utils/types";
import { login } from "@/rtk/slices/authSlice";

const url = import.meta.env.VITE_SERVER;

// Generate RSA key pair
export async function generateKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048, // Key length in bits
            publicExponent: new Uint8Array([1, 0, 1]), // Standard exponent
            hash: "SHA-256" // Hash algorithm
        },
        true, // Extractable
        ["encrypt", "decrypt"] // Usages
    );
}

// Storing a key in IndexedDB
export async function storeKey(key: string, keyName: string): Promise<void> {
    const db: IDBDatabase = await openDatabase();
    const tx: IDBTransaction = db.transaction('keys', 'readwrite');
    const store: IDBObjectStore = tx.objectStore('keys');

    store.put(key, keyName); // Store the exported key by name

    // Wait for transaction completion
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (event) => reject((event.target as IDBRequest).error);
    });
}
// Retrieving a key from IndexedDB
export async function getKey(keyName: string): Promise<string> {
    const db: IDBDatabase = await openDatabase();
    const tx: IDBTransaction = db.transaction('keys', 'readonly');
    const store: IDBObjectStore = tx.objectStore('keys');
    const request: IDBRequest = store.get(keyName); // Get key by name

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Open IndexedDB for key storage
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('my-database', 1);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore('keys'); // Create object store for keys
        };
        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };
        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
}

// Convert base64 string to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// Convert Uint8Array to base64 string
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
}

// Import AES key from base64 string
async function importAESKey(base64Key: string): Promise<CryptoKey> {
    const keyData = base64ToUint8Array(base64Key);
    return crypto.subtle.importKey(
        'raw',
        keyData.buffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt'] // Usages
    );
}

// Encrypt RSA private key using AES-GCM
export async function encryptKey(key: CryptoKey): Promise<string> {
    const base64EncryptionKey: string = import.meta.env.VITE_ENCRYPTION_KEY;
    const encryptionKey: CryptoKey = await importAESKey(base64EncryptionKey);

    // Determine the format based on the key type
    const exportedKey = await crypto.subtle.exportKey('pkcs8', key);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate IV

    // Encrypt the key using AES-GCM
    const encryptedKey = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv // Initialization vector
        },
        encryptionKey,
        exportedKey // Data to encrypt
    );

    // Combine IV and encrypted key for storage
    return uint8ArrayToBase64(new Uint8Array([...iv, ...new Uint8Array(encryptedKey)]));
}

// Decrypt encrypted base64 RSA private key using AES-GCM
export async function decryptKey(encryptedKeyBase64: string): Promise<CryptoKey> {
    const base64EncryptionKey: string = import.meta.env.VITE_ENCRYPTION_KEY;
    const encryptionKey: CryptoKey = await importAESKey(base64EncryptionKey);
    const encryptedData: Uint8Array = base64ToUint8Array(encryptedKeyBase64);

    const iv: Uint8Array = encryptedData.slice(0, 12); // Extract IV
    const encryptedKey: Uint8Array = encryptedData.slice(12); // Extract encrypted key

    // Decrypt the key using AES-GCM
    const decryptedKeyBuffer: ArrayBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv // Initialization vector
        },
        encryptionKey,
        encryptedKey // Data to decrypt
    );

    // Import the decrypted key for further usage
    const decryptedKey = await crypto.subtle.importKey(
        'pkcs8', // Format for RSA private keys
        decryptedKeyBuffer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256'
        },
        true,
        ['decrypt'] // Usages
    );
    return decryptedKey;
}

// Encrypt Data with AES and RSA
export async function encryptData(data: string, receiverKeyBase64: string, senderKeyBase64: string): Promise<string> {
    // Generate a symmetric AES-GCM key
    const symmetricKey: CryptoKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 }, // AES-GCM with 256-bit key length
        true,
        ["encrypt", "decrypt"]
    );
    const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
    const encoded: Uint8Array = new TextEncoder().encode(data); // Encode the data

    // Encrypt the message using the symmetric key
    const encryptedMessage: ArrayBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        symmetricKey,
        encoded
    );

    // Convert the receiver's base64 public key to CryptoKey
    const receiverKeyData: Uint8Array = base64ToUint8Array(receiverKeyBase64);
    const receiverPublicKey: CryptoKey = await crypto.subtle.importKey(
        'spki',
        receiverKeyData.buffer,
        {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-256' }
        },
        true,
        ['encrypt']
    );

    // Convert the sender's base64 public key to CryptoKey
    const senderKeyData: Uint8Array = base64ToUint8Array(senderKeyBase64);
    const senderPublicKey: CryptoKey = await crypto.subtle.importKey(
        'spki',
        senderKeyData.buffer,
        {
            name: 'RSA-OAEP',
            hash: { name: 'SHA-256' }
        },
        true,
        ['encrypt']
    );

    // Export the symmetric AES key
    const exportedSymmetricKey: ArrayBuffer = await crypto.subtle.exportKey("raw", symmetricKey);

    // Encrypt the symmetric key with the receiver's public key
    const encryptedSymmetricKeyForReceiver: ArrayBuffer = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        receiverPublicKey,
        exportedSymmetricKey
    );

    // Encrypt the symmetric key with the sender's public key
    const encryptedSymmetricKeyForSender: ArrayBuffer = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        senderPublicKey,
        exportedSymmetricKey
    );

    // Combine IV, encrypted symmetric keys, and encrypted message for transmission
    const combined = new Uint8Array([
        ...iv,
        ...new Uint8Array(encryptedSymmetricKeyForReceiver),
        ...new Uint8Array(encryptedSymmetricKeyForSender),
        ...new Uint8Array(encryptedMessage)
    ]);

    return uint8ArrayToBase64(combined); // Return combined data as base64 string
}

// Load Private Key from IndexedDB
let cachedPrivateKey: CryptoKey | null = null;

export async function loadPrivateKey(): Promise<CryptoKey> {
    if (cachedPrivateKey) {
        return cachedPrivateKey; // Return cached private key if available
    }

    // Retrieve and decrypt the private key from IndexedDB
    const encryptedPrivateKey: string = await getKey('data2');
    const decryptedPrivateKey: CryptoKey = await decryptKey(encryptedPrivateKey);

    cachedPrivateKey = decryptedPrivateKey; // Cache the private key for future use
    return cachedPrivateKey;
}

// Decrypt Data
export async function decryptData(encryptedData: string, side:'sender'|'receiver'): Promise<string> {
    // Decrypt the provided encryptedPrivateKey
    const privateKey: CryptoKey = await loadPrivateKey();

    const dataBuffer: ArrayBuffer = base64ToArrayBuffer(encryptedData);

    // Extract the initialization vector (IV) from the beginning of the data
    const iv: ArrayBuffer = dataBuffer.slice(0, 12); // AES-GCM typically uses a 12-byte IV

    // Define the length of the encrypted symmetric keys
    const encryptedSymmetricKeyLength = 256; // Assuming RSA-2048; adjust as necessary

    // Extract the encrypted symmetric keys and the encrypted message from the data buffer
    const encryptedSymmetricKeyForReceiver: ArrayBuffer = dataBuffer.slice(12, 12 + encryptedSymmetricKeyLength);
    const encryptedSymmetricKeyForSender: ArrayBuffer = dataBuffer.slice(12 + encryptedSymmetricKeyLength, 12 + 2 * encryptedSymmetricKeyLength);
    const encryptedMessage: ArrayBuffer = dataBuffer.slice(12 + 2 * encryptedSymmetricKeyLength);

    // Depending on the user's role (side), choose the correct encrypted symmetric key to decrypt
    let encryptedSymmetricKey;
    if (side === "receiver") {
        encryptedSymmetricKey = encryptedSymmetricKeyForReceiver;
    } else if (side === "sender") {
        encryptedSymmetricKey = encryptedSymmetricKeyForSender;
    } else {
        throw new Error("Invalid side provided. Must be 'sender' or 'receiver'.");
    }

    try {
        // Decrypt the symmetric key using the user's private key
        const decryptedKeyBuffer:ArrayBuffer = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedSymmetricKey
        );

        // Import the decrypted symmetric key for AES-GCM decryption
        const symmetricKey:CryptoKey = await crypto.subtle.importKey(
            'raw',
            decryptedKeyBuffer,
            { name: "AES-GCM" },
            true,
            ["decrypt"]
        );

        // Decrypt the message using the symmetric key and IV
        const decryptedMessageBuffer:ArrayBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            symmetricKey,
            encryptedMessage
        );

        // Decode the decrypted message from ArrayBuffer to string and return it
        return new TextDecoder().decode(decryptedMessageBuffer);
    } catch (error) {
        throw new Error("Failed to decrypt the message with the symmetric key.");
    }
}

// Utility functions
function base64ToArrayBuffer(base64:string):ArrayBuffer {
    const binaryString:string = window.atob(base64);
    const len:number = binaryString.length;
    const bytes:Uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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
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

export async function generateAESKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256 // Key length in bits
        },
        true, // Extractable
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

// Utility functions
export function base64ToArrayBuffer(base64:string):ArrayBuffer {
    const binaryString:string = window.atob(base64);
    const len:number = binaryString.length;
    const bytes:Uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
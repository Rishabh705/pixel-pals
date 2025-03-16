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

// Storing a RSA key in IndexedDB
export async function storeKey(key: CryptoKey, keyName: string): Promise<void> {
    const format = key.type === "private" ? "pkcs8" : key.type === "public" ? "spki" : "raw";
    const exportedKey = await crypto.subtle.exportKey(format, key);

    const keyDataBase64 = arrayBufferToBase64(exportedKey);

    const db: IDBDatabase = await openDatabase();
    const tx: IDBTransaction = db.transaction('keys', 'readwrite');
    const store: IDBObjectStore = tx.objectStore('keys');

    // Store the base64 string
    store.put({ keyData: keyDataBase64, format, algorithm: key.algorithm, usages: key.usages, type: key.type }, keyName);

    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = (event) => reject((event.target as IDBRequest).error);
    });
}

export async function getKey(keyName: string): Promise<CryptoKey> {
    const db: IDBDatabase = await openDatabase();
    const tx: IDBTransaction = db.transaction('keys', 'readonly');
    const store: IDBObjectStore = tx.objectStore('keys');
    const request: IDBRequest = store.get(keyName);

    return new Promise((resolve, reject) => {
        request.onsuccess = async () => {
            const result = request.result;
            if (!result) return reject('Key not found');
            
            const { keyData, format, algorithm, usages, type } = result;
            const keyBuffer = base64ToArrayBuffer(keyData);

            try {
                const importedKey = await crypto.subtle.importKey(
                    format,
                    keyBuffer,
                    algorithm,
                    true,
                    usages
                );
                resolve(importedKey);
            } catch (err) {
                reject(err);
            }
        };
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


// Import AES key from base64 string
async function importAESKey(base64Key: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(base64Key);
    return crypto.subtle.importKey(
        'raw',
        keyData,
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

// Encrypt the AES key for each participant using their public RSA key
export async function encryptSymmetricKey(publicKeysBase64Map: Map<string, string>) {
    // Generate a single AES key for the group
    const symmetricKey = await generateAESKey();

    // Export the AES key for encryption with RSA
    const exportedKey = await window.crypto.subtle.exportKey("raw", symmetricKey);

    // map to store the encrypted AES keys for each participant
    const encryptedAESKeys = new Map();

    for (const id_key_pair of publicKeysBase64Map) {
        const [id, keyBase64] = id_key_pair;

        const keyData = base64ToArrayBuffer(keyBase64);

        const publicKey = await window.crypto.subtle.importKey(
            'spki',
            keyData,
            {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' }
            },
            true,
            ['encrypt']
        );

        // Encrypt the AES key with the participant's RSA public key
        const encryptedAESKey = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            exportedKey
        );
        const encryptedAESKeyBase64 = arrayBufferToBase64(encryptedAESKey);
        encryptedAESKeys.set(id, encryptedAESKeyBase64);
    }

    return { encryptedAESKeys };
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
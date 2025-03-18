import { arrayBufferToBase64, base64ToArrayBuffer, getKey } from "./helpers";

// Load Private Key from IndexedDB
let cachedPrivateKey: CryptoKey | null = null;

export async function loadPrivateKey(): Promise<CryptoKey> {
    if (cachedPrivateKey) {
        return cachedPrivateKey; // Return cached private key if already cached
    }

    try {
        const privateKeyBase64: string = await getKey('privateKey');

        const keyBuffer: ArrayBuffer = base64ToArrayBuffer(privateKeyBase64);

        const privateKey: CryptoKey = await window.crypto.subtle.importKey(
            'pkcs8', // Format for private key
            keyBuffer,
            {
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' }
            },
            true, // extractable
            ['decrypt'] // key usages
        );

        // Cache it for future use
        cachedPrivateKey = privateKey;

        return privateKey;
    } catch (err) {
        console.error("Failed to load private key from IndexedDB:", err);
        throw new Error("Private key not found or corrupted.");
    }
}


// Decrypt the AES key using the private RSA key
async function decryptSymmetricKey(encryptedAESKeyBase64: string): Promise<CryptoKey> {
    const privateKey: CryptoKey = await loadPrivateKey();
    const encryptedAESKeyBuffer: ArrayBuffer = base64ToArrayBuffer(encryptedAESKeyBase64);

    try {
        // Decrypt using the private RSA key
        const decryptedAESKey: ArrayBuffer = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedAESKeyBuffer
        );

        // Import the decrypted AES key
        return await crypto.subtle.importKey(
            "raw",
            decryptedAESKey,
            { name: "AES-GCM" },
            true,
            ["encrypt", "decrypt"]
        );
    } catch (error) {
        console.error("Decryption failed for AES key:", error);
        throw new Error("Failed to decrypt AES key.");
    }
}



// Encrypt a message with an AES-GCM symmetric key
export async function encryptData(data: string, encryptedAESKeyBase64: string): Promise<string> {
    const symmetricKey: CryptoKey = await decryptSymmetricKey(encryptedAESKeyBase64);

    const iv: Uint8Array = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedMessage: ArrayBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        symmetricKey,
        encodedData
    );

    const combined: Uint8Array = new Uint8Array([...iv, ...new Uint8Array(encryptedMessage)]);
    return arrayBufferToBase64(combined);
}

// Decrypt the message
export async function decryptData(encryptedData: string, encryptedAESKey: string): Promise<string> {
    const symmetricKey: CryptoKey = await decryptSymmetricKey(encryptedAESKey);
    const dataBuffer: ArrayBuffer = base64ToArrayBuffer(encryptedData);
    const iv: ArrayBuffer = dataBuffer.slice(0, 12);
    const encryptedContent: ArrayBuffer = dataBuffer.slice(12);

    const decryptedMessageBuffer: ArrayBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        symmetricKey,
        encryptedContent
    );

    return new TextDecoder().decode(decryptedMessageBuffer);
}

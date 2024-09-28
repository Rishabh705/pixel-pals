import { base64ToArrayBuffer, decryptKey, getKey, uint8ArrayToBase64 } from "./helpers";

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

// Decrypt the AES key using the private RSA key
async function decryptSymmetricKey(encryptedAESKeyBase64: string): Promise<CryptoKey> {
    const privateKey: CryptoKey = await loadPrivateKey();
    const encryptedAESKeyBuffer: ArrayBuffer = base64ToArrayBuffer(encryptedAESKeyBase64);

    try {
        // Decrypt using the private key
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
        console.error("Decryption failed for an AES key, checking for further keys", error);
    }

    throw new Error("Failed to decrypt any AES key with the provided private key.");
}


// Encrypt a message with an AES-GCM symmetric key
export async function encryptData(data: string, encryptedAESKeyBase64: string): Promise<string> {
    const symmetricKey: CryptoKey = await decryptSymmetricKey(encryptedAESKeyBase64);

    const iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedMessage: ArrayBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        symmetricKey,
        encodedData
    );

    const combined: Uint8Array<ArrayBuffer> = new Uint8Array([...iv, ...new Uint8Array(encryptedMessage)]);
    return uint8ArrayToBase64(combined);
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

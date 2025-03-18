import { io } from 'socket.io-client';

const server = import.meta.env.VITE_SERVER;

const socket = io(server,{
    reconnection: true,               // Enable auto-reconnect
    reconnectionAttempts: Infinity,   // Try reconnecting forever
    reconnectionDelay: 1000,          // Start at 1 second delay
    reconnectionDelayMax: 5000,       // Max delay of 5 seconds
    timeout: 20000,                   // 20s before considering connection attempt failed
});

socket.on('connect', () => {
    console.log('Connected to server with id:', socket.id);
});

export {socket};
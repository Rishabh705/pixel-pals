import { io } from 'socket.io-client';

const server = import.meta.env.VITE_SERVER;

const socket = io(server);

socket.on('connect', () => {
    console.log('Connected to server with id:', socket.id);
});

export {socket};
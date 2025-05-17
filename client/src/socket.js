import { io } from 'socket.io-client';

const socket = io('https://bridgeon-backend.onrender.com', {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "value" 
    }
});

export default socket;

import { io } from 'socket.io-client';

const socket = io('https://connecton-backend.onrender.com', {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "value"
    }
});

export default socket;

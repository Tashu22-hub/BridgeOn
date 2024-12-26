import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "value"
    }
});

export default socket;

// client.js (in the frontend)
import { io } from 'socket.io-client';

// Connect to the NestJS WebSocket server
const socket = io('http://localhost:3001'); // Use the port you set in WebSocketGateway

// Listen for the 'message' event
socket.on('message', (data) => {
    console.log('Received from server:', data);
});

// Emit a 'message' event to the server
socket.emit('message', 'Hello, server!');

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
                   (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
                     ? 'http://localhost:5000'
                     : 'https://adam-finastra-task.onrender.com');

let socket = null;

export const initiateSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = initiateSocket();
  if (s && !s.connected) {
    s.connect();
    console.log('Socket client connected.');
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log('Socket client disconnected.');
  }
};

export const getSocket = () => socket;

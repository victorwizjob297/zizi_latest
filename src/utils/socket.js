import { io } from 'socket.io-client';
import { baseurl } from '../redux/api/constant';

let socket = null;
let connectedUsers = new Set();

export const initializeSocket = (token) => {
  if (socket) {
    return socket;
  }

  socket = io(baseurl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('user_status_changed', (data) => {
    if (data.status === 'online') {
      connectedUsers.add(data.userId);
    } else {
      connectedUsers.delete(data.userId);
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectedUsers.clear();
  }
};

export const getSocket = () => socket;

export const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

export const joinConversation = (conversationId) => {
  if (socket) {
    socket.emit('join_conversation', conversationId);
  }
};

export const leaveConversation = (conversationId) => {
  if (socket) {
    socket.emit('leave_conversation', conversationId);
  }
};

export const emitTypingStart = (conversationId) => {
  if (socket) {
    socket.emit('typing_start', { conversationId });
  }
};

export const emitTypingStop = (conversationId) => {
  if (socket) {
    socket.emit('typing_stop', { conversationId });
  }
};

export const emitMessageRead = (messageId, conversationId) => {
  if (socket) {
    socket.emit('message_read', { messageId, conversationId });
  }
};

export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new_message', callback);
  }
};

export const offNewMessage = (callback) => {
  if (socket) {
    socket.off('new_message', callback);
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user_typing', callback);
  }
};

export const offUserTyping = (callback) => {
  if (socket) {
    socket.off('user_typing', callback);
  }
};

export const onUserStoppedTyping = (callback) => {
  if (socket) {
    socket.on('user_stopped_typing', callback);
  }
};

export const offUserStoppedTyping = (callback) => {
  if (socket) {
    socket.off('user_stopped_typing', callback);
  }
};

export const onMessageRead = (callback) => {
  if (socket) {
    socket.on('message_read', callback);
  }
};

export const offMessageRead = (callback) => {
  if (socket) {
    socket.off('message_read', callback);
  }
};

export const onUserStatusChanged = (callback) => {
  if (socket) {
    socket.on('user_status_changed', callback);
  }
};

export const offUserStatusChanged = (callback) => {
  if (socket) {
    socket.off('user_status_changed', callback);
  }
};

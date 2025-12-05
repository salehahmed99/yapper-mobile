import { getToken } from '@/src/utils/secureStorage';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;
const SOCKET_PATH = process.env.EXPO_PUBLIC_SOCKET_PATH;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, SocketCallback[]> = new Map();
  private debugMode = true; // Set to false to disable socket logging

  public async connect(): Promise<Socket | null> {
    const token = await getToken();

    if (!token) {
      console.warn('SocketService: No token found, cannot connect.');
      return null;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    // Disconnect existing socket if any (e.g. reconnecting with new token)
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${SOCKET_URL}/messages`, {
      path: SOCKET_PATH,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token,
      },
      query: {
        auth: token,
      },
    });

    this.socket.connect();

    this.setupListeners();

    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public emit(event: string, data: unknown) {
    if (this.socket) {
      if (this.debugMode) {
        console.log(`[Socket EMIT] 📤 ${event}`, JSON.stringify(data, null, 2));
      }
      this.socket.emit(event, data);
    } else {
      console.warn('SocketService: Socket not connected, cannot emit', event);
    }
  }

  public on(event: string, callback: SocketCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    // Wrap callback with logging
    const wrappedCallback: SocketCallback = (...args) => {
      if (this.debugMode) {
        console.log(`[Socket RECV] 📥 ${event}`, JSON.stringify(args, null, 2));
      }
      callback(...args);
    };

    this.listeners.get(event)?.push(wrappedCallback);

    if (this.socket) {
      this.socket.on(event, wrappedCallback);
    }
  }

  public off(event: string, callback: SocketCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (this.debugMode) {
        console.log('[Socket] ✅ Connected');
      }
    });

    this.socket.on('disconnect', (reason) => {
      if (this.debugMode) {
        console.log('[Socket] ❌ Disconnected:', reason);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[Socket] ⚠️ Connection error:', error.message);
    });

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }
}

export const socketService = new SocketService();

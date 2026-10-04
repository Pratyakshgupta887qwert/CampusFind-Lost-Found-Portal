import * as signalR from '@microsoft/signalr';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'http://localhost:5000/hubs/notifications';

class SignalRService {
  constructor() {
    this.connection = null;
    this.callbacks = {
      onNotification: [],
      onLostItemBroadcast: [],
    };
  }

  async startConnection() {
    const token = localStorage.getItem('campusfind_token');
    
    // Don't connect if not logged in
    if (!token) return;

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('campusfind_token') || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Register event listeners
    this.connection.on('ReceiveNotification', (notification) => {
      this.callbacks.onNotification.forEach((cb) => cb(notification));
    });

    this.connection.on('LostItemBroadcast', (lostItem) => {
      this.callbacks.onLostItemBroadcast.forEach((cb) => cb(lostItem));
    });

    try {
      await this.connection.start();
      console.log('⚡ SignalR: Connected to CampusFind Notification Hub');
    } catch (err) {
      // Gracefully handle if backend server is not running yet
      console.warn('⚡ SignalR: Backend server offline or hub unreachable.', err.message);
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.error('SignalR disconnect error', err);
      }
      this.connection = null;
    }
  }

  onReceiveNotification(callback) {
    this.callbacks.onNotification.push(callback);
    return () => {
      this.callbacks.onNotification = this.callbacks.onNotification.filter((cb) => cb !== callback);
    };
  }

  onLostItemBroadcast(callback) {
    this.callbacks.onLostItemBroadcast.push(callback);
    return () => {
      this.callbacks.onLostItemBroadcast = this.callbacks.onLostItemBroadcast.filter((cb) => cb !== callback);
    };
  }
}

export const signalRService = new SignalRService();
export default signalRService;

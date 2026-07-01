/**
 * WebSocket Service for Real-time Notifications
 * Handles connection, reconnection, and message handling
 */

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private isIntentionalClose = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(url?: string) {
    this.url = url || '';
  }

  private getWebSocketBaseUrl(): string {
    if (this.url && this.url.trim().length > 0) return this.url;

    const backendOrigin =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN ||
      (import.meta.env.DEV ? 'http://localhost:3000' : 'https://sweepro.in');

    const wsFromBackend = backendOrigin.startsWith('https://')
      ? backendOrigin.replace('https://', 'wss://')
      : backendOrigin.replace('http://', 'ws://');

    return ((import.meta as any).env?.VITE_WS_URL || wsFromBackend) as string;
  }

  /**
   * Connect to WebSocket server
   * M4 FIX: Token is NO LONGER sent in the URL query string.
   * URL params are logged by web servers, CDNs, proxies, and appear in browser
   * history — all of which are token leakage vectors.
   * Instead, the token is sent as the very first message after the socket opens
   * (see handleOpen). The server must require auth before processing other msgs.
   */
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.token = token;
    this.isIntentionalClose = false;

    try {
      const wsBaseUrl = this.getWebSocketBaseUrl();
      // M4: No token in the URL. Server accepts the connection and waits for
      // the auth message (sent in handleOpen) before trusting any messages.
      this.ws = new WebSocket(wsBaseUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event.
   * M4 FIX: Send the auth token as the first message so it never appears in
   * URLs, server access logs, CDN logs, or browser history.
   */
  private handleOpen(): void {
    // Send auth token as first message — server must validate before trusting
    // any subsequent messages from this connection.
    if (this.token) {
      this.ws?.send(JSON.stringify({ type: 'auth', token: this.token }));
    }

    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.connectionHandlers.forEach(handler => handler());
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Handle different message types
      switch (data.type) {
        case 'notification':
          console.log('📬 New notification received:', data.notification);
          this.messageHandlers.forEach(handler => handler(data.notification));
          break;

        case 'pong':
          // Heartbeat response
          break;

        case 'connected':
          console.log('Connected to notification service:', data.message);
          break;

        default:
          console.log('Unknown message type:', data);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Event): void {
    console.error('❌ WebSocket error:', error);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);

    this.stopHeartbeat();

    // Notify disconnection handlers
    this.disconnectionHandlers.forEach(handler => handler());

    // Attempt to reconnect if not intentional
    if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isIntentionalClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Send message through WebSocket
   */
  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Subscribe to incoming messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to connection events
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);

    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to disconnection events
   */
  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.add(handler);

    return () => {
      this.disconnectionHandlers.delete(handler);
    };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;

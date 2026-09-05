import type { AppEvent, AppEventHandler } from '@/types/eventTypes';

class EventBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<AppEventHandler> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('roommate_app_events');
        this.channel.onmessage = (event: MessageEvent<AppEvent>) => {
          if (event.data && typeof event.data.type === 'string') {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, falling back to local bus:', err);
      }
    }
  }

  public publish(event: AppEvent): void {
    // Notify local listeners
    this.notifyListeners(event);

    // Broadcast to other browser tabs
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('Failed to broadcast event to channel:', err);
      }
    }
  }

  public subscribe(handler: AppEventHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  private notifyListeners(event: AppEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in EventBus listener:', err);
      }
    });
  }
}

export const eventBus = new EventBus();

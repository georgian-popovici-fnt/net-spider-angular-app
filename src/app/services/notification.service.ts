import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  readonly notification$ = this.notificationSubject.asObservable();

  private notificationId = 0;

  constructor() {}

  /**
   * Show a success notification
   */
  success(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'success',
      duration,
      id: ++this.notificationId
    });
  }

  /**
   * Show an error notification
   */
  error(message: string, duration: number = 5000): void {
    this.show({
      message,
      type: 'error',
      duration,
      id: ++this.notificationId
    });
  }

  /**
   * Show an info notification
   */
  info(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'info',
      duration,
      id: ++this.notificationId
    });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, duration: number = 4000): void {
    this.show({
      message,
      type: 'warning',
      duration,
      id: ++this.notificationId
    });
  }

  /**
   * Show a notification
   */
  private show(notification: Notification): void {
    this.notificationSubject.next(notification);

    // Auto-hide after duration
    if (notification.duration) {
      setTimeout(() => {
        this.hide();
      }, notification.duration);
    }
  }

  /**
   * Hide the current notification
   */
  hide(): void {
    this.notificationSubject.next(null);
  }
}

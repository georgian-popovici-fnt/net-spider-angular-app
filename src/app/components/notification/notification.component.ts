import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  notification: Notification | null = null;
  isVisible = false;

  constructor(private notificationService: NotificationService) {
    this.notificationService.notification$.subscribe(notification => {
      if (notification) {
        this.notification = notification;
        this.isVisible = true;
      } else {
        this.isVisible = false;
        // Clear notification after animation
        setTimeout(() => {
          this.notification = null;
        }, 300); // Match animation duration
      }
    });
  }

  close(): void {
    this.notificationService.hide();
  }

  getIcon(): string {
    if (!this.notification) return '';

    switch (this.notification.type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  }
}

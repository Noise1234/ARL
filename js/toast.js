/**
 * ARL - Minimalist Monochrome Toast Notification System
 * Tactile, non-blocking floating alerts for sync status, errors, and feedback.
 */

class ToastService {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'toast-container';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show(message, type = 'info', durationMs = 3500) {
    if (typeof document === 'undefined') {
      console.log(`[Toast ${type.toUpperCase()}] ${message}`);
      return;
    }
    if (!this.container) {
      this.initContainer();
    }
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    let tag = '[INFO]';
    if (type === 'success') tag = '[OK]';
    if (type === 'error') tag = '[ERR]';
    if (type === 'warning') tag = '[WARN]';

    toast.innerHTML = `
      <span class="toast-tag font-mono">${tag}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-dismiss-btn" aria-label="Dismiss">✕</button>
    `;

    const removeToast = () => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    };

    toast.querySelector('.toast-dismiss-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      removeToast();
    });

    toast.addEventListener('click', () => removeToast());

    this.container.appendChild(toast);

    if (durationMs > 0) {
      setTimeout(removeToast, durationMs);
    }
  }

  success(msg, duration) {
    this.show(msg, 'success', duration);
  }

  error(msg, duration = 4500) {
    this.show(msg, 'error', duration);
  }

  info(msg, duration) {
    this.show(msg, 'info', duration);
  }

  warning(msg, duration) {
    this.show(msg, 'warning', duration);
  }
}

export const toast = new ToastService();
export const showToast = (msg, type, duration) => toast.show(msg, type, duration);

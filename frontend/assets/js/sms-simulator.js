/**
 * SMS Simulator for SOMEX
 * Polls for new notifications and shows them as a smartphone popup
 */

class SMSSimulator {
  constructor() {
    this.apiBase = window.API_BASE || "http://localhost:4000";
    this.pollInterval = 3000; // 3 seconds
    this.init();
  }

  init() {
    this.createStyles();
    this.createContainer();
    this.startPolling();
  }

  createStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
      .sms-simulator-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .sms-notification {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        width: 320px;
        padding: 15px;
        margin-top: 10px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        border-left: 5px solid #307c2b;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .sms-notification.show {
        transform: translateY(0);
        opacity: 1;
      }

      .sms-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        color: #777;
      }

      .sms-app-name {
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: bold;
        color: #307c2b;
      }

      .sms-body {
        font-size: 14px;
        color: #333;
        line-height: 1.4;
      }

      .sms-phone-number {
        font-weight: bold;
        display: block;
        margin-bottom: 2px;
      }

      .sms-time {
        font-size: 11px;
      }

      .sms-close {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 18px;
        color: #ccc;
        border: none;
        background: none;
      }

      .sms-icon {
        width: 14px;
        height: 14px;
        background: #307c2b;
        border-radius: 3px;
        display: inline-block;
      }

      /* Animation for new message */
      @keyframes sms-vibrate {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }

      .vibrate {
        animation: sms-vibrate 0.3s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }

  createContainer() {
    this.container = document.createElement("div");
    this.container.className = "sms-simulator-container";
    document.body.appendChild(this.container);
  }

  startPolling() {
    setInterval(() => this.checkNotifications(), this.pollInterval);
    // Check immediately on load
    this.checkNotifications();
  }

  async checkNotifications() {
    try {
      const response = await fetch(`${this.apiBase}/api/notificaciones/pendientes`);
      if (!response.ok) return;
      
      const notifications = await response.json();
      
      for (const sms of notifications) {
        const smsId = sms.id || sms.id_notificacion;
        if (!smsId) continue;
        
        this.showNotification(sms);
        await this.markAsSent(smsId);
      }
    } catch (error) {
      console.error("SMS Simulator Error:", error);
    }
  }

  async markAsSent(id) {
    try {
      await fetch(`${this.apiBase}/api/notificaciones/${id}/enviado`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error("Error marking SMS as sent:", error);
    }
  }

  showNotification(sms) {
    const notification = document.createElement("div");
    notification.className = "sms-notification vibrate";
    
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    notification.innerHTML = `
      <button class="sms-close">&times;</button>
      <div class="sms-header">
        <div class="sms-app-name">
          <div class="sms-icon"></div>
          MENSAJES
        </div>
        <div class="sms-time">ahora</div>
      </div>
      <div class="sms-body">
        <span class="sms-phone-number">${sms.numero_celular}</span>
        ${sms.mensaje}
      </div>
    `;

    this.container.appendChild(notification);

    // Initial sound (optional, but good for demo)
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.play();
    } catch (e) {}

    // Show with animation
    setTimeout(() => {
      notification.classList.remove("vibrate");
      notification.classList.add("show");
    }, 100);

    // Auto remove after 15 seconds
    const timeout = setTimeout(() => {
      this.closeNotification(notification);
    }, 15000);

    notification.onclick = () => {
      clearTimeout(timeout);
      this.closeNotification(notification);
    };

    notification.querySelector('.sms-close').onclick = (e) => {
      e.stopPropagation();
      clearTimeout(timeout);
      this.closeNotification(notification);
    };
  }

  closeNotification(el) {
    el.classList.remove("show");
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 500);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.smsSimulator = new SMSSimulator();
});

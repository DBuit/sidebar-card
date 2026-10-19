// ------------------------------------------------------------------------------------------
//  SIDEBAR-CARD
// ------------------------------------------------------------------------------------------
//  https://github.com/DBuit/sidebar-card
// ------------------------------------------------------------------------------------------

// ##########################################################################################
// ###   Global constants
// ##########################################################################################

const SIDEBAR_CARD_TITLE = 'SIDEBAR-CARD';
const SIDEBAR_CARD_VERSION = '0.2.4';

// ##########################################################################################
// ###   Import dependencies
// ##########################################################################################

import { css, html, LitElement } from 'lit-element';
import { moreInfo } from 'card-tools/src/more-info';
import { hass, provideHass } from 'card-tools/src/hass';
import { subscribeRenderTemplate } from 'card-tools/src/templates';
import moment from 'moment/min/moment-with-locales';
import { forwardHaptic, navigate, toggleEntity } from 'custom-card-helpers';


// ##########################################################################################
// ###   Notifications Element
// ##########################################################################################
interface HassEntity {
  entity_id: string;
  state: string;
  attributes: any;
}

interface HassStates {
  [entity_id: string]: HassEntity;
}

interface Hass {
  states: HassStates;
  callService: (domain: string, service: string, data?: any) => void;
  language?: string;
}

interface NotificationEntity {
  notification_id: string;
  title: string;
  message: string;
  created_at: string;
}

class NotificationsElement extends LitElement {
  hass: any;
  notifications: NotificationEntity[] = [];
  private _unsubscribe: (() => void) | null = null;

  /* **************************************** *
   *        Element's public properties       *
   * **************************************** */
  static get properties() {
    return {
      hass: { type: Object },
      notifications: { type: Array }
    };
  }

  constructor() {
    super();
    this.hass = null;
    this.notifications = [];
  }

  protected updated(changedProperties): void {
    if (changedProperties.has('hass') && this.hass?.connection && !this._unsubscribe) {
      this._subscribeNotifications();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  private async _subscribeNotifications(): Promise<void> {
    this._unsubscribe = await this.hass.connection.subscribeMessage(
      (message: any) => {
        if (message.type === 'current') {
          this.notifications = (Object.values(message.notifications) as NotificationEntity[])
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (message.type === 'added') {
          this.notifications = [...this.notifications, ...(Object.values(message.notifications) as NotificationEntity[])]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (message.type === 'removed') {
          const removedIds = new Set(Object.keys(message.notifications));
          this.notifications = this.notifications.filter(n => !removedIds.has(n.notification_id));
        }
      },
      { type: 'persistent_notification/subscribe' }
    );
  }

  private _getNotificationIcon(title: string) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('invalid') || lowerTitle.includes('error') || lowerTitle.includes('failed')) {
      return html`
        <svg class="notification-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    }
    if (lowerTitle.includes('update') || lowerTitle.includes('available')) {
      return html`
        <svg class="notification-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
      `;
    }
    if (lowerTitle.includes('success') || lowerTitle.includes('completed')) {
      return html`
        <svg class="notification-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m9,12 3,3 8-8"></path>
        </svg>
      `;
    }
    return html`
      <svg class="notification-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m21.73,18-8-14a2,2 0 0,0-3.48,0l-8,14A2,2 0 0,0,4,21H20A2,2 0 0,0,21.73,18Z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;
  }

  private _getTimeAgo(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  private _formatMessage(message: string): string {
    if (!message) return '';
    
    return message
      .split('\n')
      .map((line: string) => {
        if (line.trim().startsWith('•')) {
          return `<div class="bullet-point">• ${line.replace('•', '').trim()}</div>`;
        }
        return line.trim() ? `<div>${line}</div>` : '';
      })
      .filter((line: string) => line)
      .join('');
  }

  private _dismissNotification(notificationId: string): void {
    if (!this.hass) return;
    this.hass.callService('persistent_notification', 'dismiss', {
      notification_id: notificationId
    });
  }

  private _dismissAll(): void {
    if (!this.hass || !this.notifications.length) return;
    this.notifications.forEach((notification: NotificationEntity) => {
      this._dismissNotification(notification.notification_id);
    });
  }

  protected render() {
    if (!this.notifications || this.notifications.length === 0) {
      return ``;
    }

    return html`
      <div class="notifications-container">
        ${this.notifications.map((notification: NotificationEntity) => html`
          <div class="notification-card">
            <div class="notification-header">
              <div class="notification-title-row">
                ${this._getNotificationIcon(notification.title)}
                <h3 class="notification-title">${notification.title}</h3>
              </div>
              <button
                class="dismiss-icon-btn"
                @click="${() => this._dismissNotification(notification.notification_id)}"
                aria-label="Dismiss notification"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div class="notification-message" .innerHTML="${this._formatMessage(notification.message)}">
            </div>
            
            <div class="notification-footer">
              <span class="notification-time">
                ${this._getTimeAgo(notification.created_at)}
              </span>
              <button
                class="dismiss-btn"
                @click="${() => this._dismissNotification(notification.notification_id)}"
              >
                Dismiss
              </button>
            </div>
          </div>
        `)}
        
        ${this.notifications.length > 1 ? html`
          <div class="dismiss-all-container">
            <button class="dismiss-all-btn" @click="${this._dismissAll}">
              Dismiss All
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      .notifications-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 20px 0;
      }

      .notification-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }

      .no-notifications {
        text-align: center;
        padding: 24px 16px;
      }

      .no-notifications-title {
        color: var(--sidebar-text-color, #fff);
        margin: 8px 0 4px 0;
        font-size: 16px;
        font-weight: 500;
      }

      .no-notifications-subtitle {
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-size: 14px;
      }

      .notification-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .notification-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .notification-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .notification-icon.error {
        color: #ef4444;
      }

      .notification-icon.info {
        color: #3b82f6;
      }

      .notification-icon.success {
        color: #10b981;
      }

      .notification-icon.warning {
        color: #f59e0b;
      }

      .notification-title {
        color: var(--sidebar-text-color, #fff);
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
      }

      .dismiss-icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
      }

      .dismiss-icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .dismiss-icon-btn svg {
        width: 16px;
        height: 16px;
        color: rgba(255, 255, 255, 0.7);
      }

      .dismiss-icon-btn:hover svg {
        color: var(--sidebar-text-color, #fff);
      }

      .notification-message {
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 12px;
      }

      .notification-message .bullet-point {
        margin-left: 16px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 4px;
      }

      .notification-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .notification-time {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
      }

      .dismiss-btn {
        background: #fbbf24;
        color: #000;
        border: none;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .dismiss-btn:hover {
        background: #f59e0b;
      }

      .dismiss-all-container {
        text-align: center;
        padding-top: 8px;
      }

      .dismiss-all-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .dismiss-all-btn:hover {
        color: var(--sidebar-text-color, #fff);
      }
    `;
  }
}

customElements.define('notifications-element', NotificationsElement);


// ##########################################################################################
// ###   Glance Bar - at-a-glance status icons
// ##########################################################################################

type GlanceConditionType =
  | 'always' | 'state' | 'state_not'
  | 'numeric_above' | 'numeric_below'
  | 'time_after' | 'time_before'
  | 'sun_below_horizon' | 'sun_above_horizon';

interface GlanceCondition {
  condition: GlanceConditionType;
  entity?: string;
  state?: string | string[];
  threshold?: number;
  after?: string;
  before?: string;
}

interface GlanceBadge {
  condition?: GlanceConditionType;
  entity?: string;
  state?: string | string[];
  threshold?: number;
  after?: string;
  before?: string;
  icon?: string;
  color?: string;
  label?: 'state' | 'attribute';
  label_attribute?: string;
  label_max_length?: number;
}

interface GlanceItem {
  entity: string;
  icon: string;
  name?: string;
  color?: string;
  show?: GlanceCondition | GlanceConditionType;
  badge?: GlanceBadge;
  tap_action?: { action: string; entity?: string; navigation_path?: string; url_path?: string };
}

class GlanceBarElement extends LitElement {
  hass: any;
  items: GlanceItem[] = [];
  private _tickInterval: any = null;

  static get properties() {
    return { hass: { type: Object }, items: { type: Array } };
  }

  connectedCallback() {
    super.connectedCallback();
    this._tickInterval = setInterval(() => this.requestUpdate(), 30000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._tickInterval);
    this._tickInterval = null;
  }

  private _minutesNow(): number {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  private _parseMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private _evalCondition(cond: GlanceCondition | GlanceConditionType | undefined, defaultEntity: string): boolean {
    if (!cond || cond === 'always') return true;

    const c: GlanceCondition = typeof cond === 'string' ? { condition: cond } : cond;
    const entityId = c.entity || defaultEntity;
    const entityState = this.hass?.states?.[entityId];

    switch (c.condition) {
      case 'always': return true;
      case 'state': {
        if (!entityState) return false;
        const targets = Array.isArray(c.state) ? c.state : [c.state as string];
        return targets.includes(entityState.state);
      }
      case 'state_not': {
        if (!entityState) return true;
        const targets = Array.isArray(c.state) ? c.state : [c.state as string];
        return !targets.includes(entityState.state);
      }
      case 'numeric_above':
        return entityState && c.threshold !== undefined ? parseFloat(entityState.state) > c.threshold : false;
      case 'numeric_below':
        return entityState && c.threshold !== undefined ? parseFloat(entityState.state) < c.threshold : false;
      case 'time_after':
        return c.after ? this._minutesNow() >= this._parseMinutes(c.after) : false;
      case 'time_before':
        return c.before ? this._minutesNow() < this._parseMinutes(c.before) : false;
      case 'sun_below_horizon':
        return this.hass?.states?.['sun.sun']?.state === 'below_horizon';
      case 'sun_above_horizon':
        return this.hass?.states?.['sun.sun']?.state === 'above_horizon';
      default:
        return false;
    }
  }

  private _evalBadge(badge: GlanceBadge | undefined, defaultEntity: string): boolean {
    if (!badge) return false;
    return this._evalCondition({
      condition: badge.condition || 'always',
      entity: badge.entity,
      state: badge.state,
      threshold: badge.threshold,
      after: badge.after,
      before: badge.before,
    }, defaultEntity);
  }

  private _getBadgeLabel(badge: GlanceBadge | undefined, defaultEntity: string): string | null {
    if (!badge?.label) return null;
    const entityId = badge.entity || defaultEntity;
    const entityState = this.hass?.states?.[entityId];
    if (!entityState) return null;

    const raw = badge.label === 'attribute' && badge.label_attribute
      ? String(entityState.attributes[badge.label_attribute] ?? '')
      : entityState.state;

    const max = badge.label_max_length ?? 3;
    return raw.length > max ? raw.slice(0, max) : raw;
  }

  private _handleClick(e: Event, item: GlanceItem) {
    e.stopPropagation();
    const action = item.tap_action;
    if (!action || action.action === 'more-info') {
      moreInfo(action?.entity || item.entity);
      return;
    }
    switch (action.action) {
      case 'navigate':
        if (action.navigation_path) navigate(window, action.navigation_path);
        break;
      case 'toggle':
        toggleEntity(this.hass, action.entity || item.entity);
        forwardHaptic('success');
        break;
      case 'url':
        if (action.url_path) window.open(action.url_path);
        break;
    }
  }

  protected render() {
    if (!this.hass || !this.items?.length) return html``;

    const visible = this.items.filter(item =>
      this.hass.states[item.entity] !== undefined &&
      this._evalCondition(item.show, item.entity)
    );

    if (!visible.length) return html``;

    return html`
      <div class="glance-bar">
        ${visible.map(item => {
          const entityState = this.hass.states[item.entity];
          const label = item.name || entityState?.attributes?.friendly_name || item.entity;
          const showBadge = this._evalBadge(item.badge, item.entity);
          const badgeColor = item.badge?.color ?? '#ef4444';
          const badgeIcon = item.badge?.icon;
          const badgeLabel = showBadge ? this._getBadgeLabel(item.badge, item.entity) : null;

          return html`
            <div
              class="glance-item${showBadge ? ' has-badge' : ''}"
              title="${label}: ${entityState?.state ?? ''}"
              @click="${(e) => this._handleClick(e, item)}"
            >
              <ha-icon
                icon="${item.icon}"
                style="${item.color ? `color: ${item.color}` : ''}"
              ></ha-icon>
              ${showBadge ? html`
                <span class="glance-badge" style="--badge-color: ${badgeColor}">
                  ${badgeIcon ? html`<ha-icon icon="${badgeIcon}" class="badge-icon"></ha-icon>` : html``}
                  ${badgeLabel ? html`<span class="badge-label">${badgeLabel}</span>` : html``}
                </span>
              ` : html``}
            </div>
          `;
        })}
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: sticky;
        bottom: 0;
        z-index: 100;
        /* pushes bar to bottom of the flex column when content is shorter than the sidebar */
        margin-top: auto;
      }

      :host::before {
        content: '';
        position: absolute;
        top: -32px;
        left: 0;
        right: 0;
        height: 32px;
        /* fades into whatever background the bar uses; invisible when bar is transparent */
        background: linear-gradient(to bottom, transparent, var(--glance-bar-background, transparent));
        pointer-events: none;
      }

      .glance-bar {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        padding: 8px 0 16px;
        background: var(--glance-bar-background, transparent);
        border-top: var(--glance-bar-border-top, none);
      }

      .glance-item {
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--sidebar-card-background, rgba(255, 255, 255, 0.06));
        border: 1px solid var(--sidebar-border-color, rgba(255, 255, 255, 0.1));
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease;
      }

      .glance-item:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: scale(1.08);
      }

      .glance-item ha-icon {
        color: var(--sidebar-icon-color, rgba(255, 255, 255, 0.85));
        --mdc-icon-size: 22px;
        display: flex;
      }

      .glance-item.has-badge ha-icon {
        color: var(--sidebar-selected-icon-color, #60a5fa);
      }

      .glance-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 14px;
        height: 14px;
        border-radius: 7px;
        background: var(--badge-color, #ef4444);
        border: 2px solid var(--sidebar-background, var(--primary-background-color, #111));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 2px;
        box-sizing: border-box;
        gap: 1px;
      }

      .badge-icon {
        --mdc-icon-size: 8px;
        color: #fff;
        flex-shrink: 0;
      }

      .badge-label {
        font-size: 9px;
        font-weight: 700;
        color: #fff;
        line-height: 1;
        white-space: nowrap;
        letter-spacing: -0.02em;
      }
    `;
  }
}

customElements.define('glance-bar-element', GlanceBarElement);


const weatherIconUrls = {
  'clear-night': '/local/weather-icons/meteocons/clear-night.svg',
  'cloudy': '/local/weather-icons/meteocons/cloudy.svg',
  'fog': '/local/weather-icons/meteocons/fog.svg',
  'hail': '/local/weather-icons/meteocons/hail.svg',
  'lightning': '/local/weather-icons/meteocons/thunderstorms.svg',
  'lightning-rainy': '/local/weather-icons/meteocons/thunderstorms.svg',
  'partlycloudy': '/local/weather-icons/meteocons/partly-cloudy-day.svg',
  'pouring': '/local/weather-icons/meteocons/rain.svg',
  'rainy': '/local/weather-icons/meteocons/rain.svg',
  'snowy': '/local/weather-icons/meteocons/snow.svg',
  'snowy-rainy': '/local/weather-icons/meteocons/sleet.svg',
  'sunny': '/local/weather-icons/meteocons/clear-day.svg',
  'windy': '/local/weather-icons/meteocons/wind.svg',
  'windy-variant': '/local/weather-icons/meteocons/wind.svg',
  'exceptional': '/local/weather-icons/meteocons/cloudy.svg'
};


// ##########################################################################################
// ###   The actual Sidebar Card element
// ##########################################################################################

class SidebarCard extends LitElement {
  /* **************************************** *
   *        Element's local properties        *
   * **************************************** */

  config: any;
  hass: any;
  shadowRoot: any;
  renderCard: any;
  templateLines: any = [];
  clock = false;
  updateMenu = true;
  digitalClock = false;
  twelveHourVersion = false;
  digitalClockWithSeconds = false;
  period = false;
  date = false;
  dateFormat = 'DD MMMM';
  weather = false;
  weatherEntity = '';
  weatherFormat = 'temperature_unit';
  bottomCard: any = null;
  widgetCard: any = null;
  CUSTOM_TYPE_PREFIX = 'custom:';
  notifications = false; // Add this line
  glanceBar: GlanceItem[] | null = null;
  private _resizeObserver: any = null;

  /* **************************************** *
   *        Element's public properties       *
   * **************************************** */

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {},
    };
  }

  /* **************************************** *
   *           Element constructor            *
   * **************************************** */

  constructor() {
    super();
  }


  /* **************************************** *
   *              Card Helpers                *
   * **************************************** */

  async createCard(cardConfig, containerSelector, styleConfig) {
    if (!cardConfig || typeof cardConfig !== 'object' || !cardConfig.type) {
      error2console('createCard', 'Invalid card config!');
      return null;
    }
  
    let tag = cardConfig.type;
    if (tag.startsWith(this.CUSTOM_TYPE_PREFIX)) {
      tag = tag.substr(this.CUSTOM_TYPE_PREFIX.length);
    } else {
      tag = `hui-${tag}-card`;
    }
  
    console.info(`Creating card with tag: ${tag}`);
  
    // Method 2: Create element and verify it has required methods
    const cardElement = document.createElement(tag);
    
    // Wait a bit for the element to fully initialize
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!cardElement) {
      error2console('createCard', `Failed to create element: ${tag}`);
      return null;
    }
  
    // Check if it's a proper Home Assistant card
    if (typeof cardElement.setConfig !== 'function') {
      // Try to wait a bit more and check again
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (typeof cardElement.setConfig !== 'function') {
        console.error(`Element ${tag} is not a valid Home Assistant card (no setConfig method)`);
        return null;
      }
    }
    try {
      // Configure the card
      cardElement.setConfig(cardConfig);
      cardElement.hass = hass();
  
      // Append to container
      const container = this.shadowRoot.querySelector(containerSelector);
      if (container) {
        container.appendChild(cardElement);
        provideHass(cardElement);
  
        // Apply custom styles if provided
        if (styleConfig && styleConfig.cardStyle) {
          this.applyCardStyles(cardElement, styleConfig.cardStyle);
        }
  
        console.info(`Successfully created and configured card: ${tag}`);
        return cardElement;
      } else {
        error2console('createCard', `Container ${containerSelector} not found`);
        return null;
      }
    } catch (error) {
      error2console('createCard', `Error configuring card ${tag}:`, error);
      return null;
    }
  }
  
  applyCardStyles(cardElement, styleString) {
    let iterations = 0;
    const maxIterations = 20; // Increased max iterations
    
    const interval = setInterval(() => {
      if (cardElement && cardElement.shadowRoot) {
        clearInterval(interval);
        const styleElement = document.createElement('style');
        styleElement.innerHTML = styleString;
        cardElement.shadowRoot.appendChild(styleElement);
        console.info('Card styles applied successfully');
      } else if (++iterations >= maxIterations) {
        clearInterval(interval);
        console.warn('Failed to apply card styles - shadowRoot not available');
      }
    }, 100);
  }

  /* **************************************** *
   *   Element's HTML renderer (lit-element)  *
   * **************************************** */

  render() {
    const sidebarMenu = this.config.sidebarMenu;
    const title = 'title' in this.config ? this.config.title : false;
    const addStyle = 'style' in this.config;

    this.clock = this.config.clock ? this.config.clock : false;
    this.digitalClock = this.config.digitalClock ? this.config.digitalClock : false;
    this.digitalClockWithSeconds = this.config.digitalClockWithSeconds ? this.config.digitalClockWithSeconds : false;
    this.twelveHourVersion = this.config.twelveHourVersion ? this.config.twelveHourVersion : false;
    this.period = this.config.period ? this.config.period : false;
    this.date = this.config.date ? this.config.date : false;
    this.dateFormat = this.config.dateFormat ? this.config.dateFormat : 'DD MMMM';
    this.weather = this.config.weather ? this.config.weather : false;
    this.weatherEntity = this.config.weatherEntity ? this.config.weatherEntity : '';
    this.weatherFormat = this.config.weatherFormat ? this.config.weatherFormat : 'temperature_unit';
    this.widgetCard = this.config.widgetCard ? this.config.widgetCard : null;
    this.bottomCard = this.config.bottomCard ? this.config.bottomCard : null;
    this.updateMenu = this.config.hasOwnProperty('updateMenu') ? this.config.updateMenu : true;
    this.notifications = this.config.notifications ? this.config.notifications : false;
    this.glanceBar = this.config.glanceBar ? this.config.glanceBar : null;

    return html`
      ${addStyle
        ? html`
            <style>
              ${this.config.style}
            </style>
          `
        : html``}

      <div class="sidebar-inner">
        ${this.digitalClock
          ? html`
              <h1 class="digitalClock${title ? ' with-title' : ''}${this.digitalClockWithSeconds ? ' with-seconds' : ''}"></h1>
            `
          : html``}
        ${this.clock
          ? html`
              <div class="clock">
                <div class="wrap">
                  <span class="hour"></span>
                  <span class="minute"></span>
                  <span class="second"></span>
                  <span class="dot"></span>
                </div>
              </div>
            `
          : html``}
        ${title
          ? html`
              <h1 class="title">${title}</h1>
            `
          : html``}
        ${this.date
          ? html`
              <h2 class="date"></h2>
            `
          : html``}
        ${this.weather && this.weatherEntity
          ? html`
              <div class="weather-widget">
                <div class="weather-icon">
                  <i class="meteo-icon"></i>
                </div>
                <div class="weather-info">
                  <span class="weather-temp"></span>
                  <span class="weather-desc"></span>
                </div>
              </div>
            `
          : html``}
        ${sidebarMenu && sidebarMenu.length > 0
          ? html`
              <ul class="sidebarMenu">
                ${sidebarMenu.map((sidebarMenuItem) => {
                  return html`
                    <li @click="${(e) => this._menuAction(e)}" class="${sidebarMenuItem.state && this.hass.states[sidebarMenuItem.state].state != 'off' && this.hass.states[sidebarMenuItem.state].state != 'unavailable' ? 'active' : ''}" data-type="${sidebarMenuItem.action}" data-path="${sidebarMenuItem.navigation_path ? sidebarMenuItem.navigation_path : ''}" data-menuitem="${JSON.stringify(sidebarMenuItem)}">
                      <span>${sidebarMenuItem.name}</span>
                      ${sidebarMenuItem.icon
                        ? html`
                            <ha-icon @click="${(e) => this._menuAction(e)}" icon="${sidebarMenuItem.icon}"></ha-icon>
                          `
                        : html``}
                    </li>
                  `;
                })}
              </ul>
            `
          : html``}
        ${this.widgetCard
          ? html`
              <div class="widget-card"></div>
            `
          : html``}
        ${this.config.template
          ? html`
              <ul class="template">
                ${this.templateLines.map((line) => {
                  return html`
                    ${createElementFromHTML(line)}
                  `;
                })}
              </ul>
            `
          : html``}
        ${this.notifications
          ? html`
              <notifications-element .hass=${this.hass}></notifications-element>
            `
          : html``}
        ${this.bottomCard
          ? html`
              <div class="bottom"></div>
            `
          : html``}
        ${this.glanceBar && this.glanceBar.length > 0
          ? html`<glance-bar-element .hass=${this.hass} .items=${this.glanceBar}></glance-bar-element>`
          : html``}
      </div>
    `;
  }

  _runClock() {
    let hoursampm;
    let digitalTime;
    const date = new Date();

    let fullHours = date.getHours().toString();
    const realHours = date.getHours();
    const hours = ((realHours + 11) % 12) + 1;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hour = Math.floor((hours * 60 + minutes) / 2);
    const minute = minutes * 6;
    const second = seconds * 6;

    if (this.clock) {
      this.shadowRoot.querySelector('.hour').style.transform = `rotate(${hour}deg)`;
      this.shadowRoot.querySelector('.minute').style.transform = `rotate(${minute}deg)`;
      this.shadowRoot.querySelector('.second').style.transform = `rotate(${second}deg)`;
    }
    if (this.digitalClock && !this.twelveHourVersion) {
      const minutesString = minutes.toString();
      digitalTime = fullHours.length < 2 ? '0' + fullHours + ':' : fullHours + ':';
      if (this.digitalClockWithSeconds) {
        digitalTime += minutesString.length < 2 ? '0' + minutesString + ':' : minutesString + ':';
        const secondsString = seconds.toString();
        digitalTime += secondsString.length < 2 ? '0' + secondsString : secondsString;
      } else {
        digitalTime += minutesString.length < 2 ? '0' + minutesString : minutesString;
      }
      this.shadowRoot.querySelector('.digitalClock').textContent = digitalTime;
    } else if (this.digitalClock && this.twelveHourVersion && !this.period) {
      hoursampm = date.getHours();
      hoursampm = hoursampm % 12;
      hoursampm = hoursampm ? hoursampm : 12;
      fullHours = hoursampm.toString();
      const minutesString = minutes.toString();
      digitalTime = fullHours.length < 2 ? '0' + fullHours + ':' : fullHours + ':';
      if (this.digitalClockWithSeconds) {
        digitalTime += minutesString.length < 2 ? '0' + minutesString + ':' : minutesString + ':';
        const secondsString = seconds.toString();
        digitalTime += secondsString.length < 2 ? '0' + secondsString : secondsString;
      } else {
        digitalTime += minutesString.length < 2 ? '0' + minutesString : minutesString;
      }
      //digitalTime;
      this.shadowRoot.querySelector('.digitalClock').textContent = digitalTime;
    } else if (this.digitalClock && this.twelveHourVersion && this.period) {
      var ampm = realHours >= 12 ? 'pm' : 'am';
      hoursampm = date.getHours();
      hoursampm = hoursampm % 12;
      hoursampm = hoursampm ? hoursampm : 12;
      fullHours = hoursampm.toString();
      const minutesString = minutes.toString();
      digitalTime = fullHours.length < 2 ? '0' + fullHours + ':' : fullHours + ':';
      if (this.digitalClockWithSeconds) {
        digitalTime += minutesString.length < 2 ? '0' + minutesString + ':' : minutesString + ':';
        const secondsString = seconds.toString();
        digitalTime += secondsString.length < 2 ? '0' + secondsString : secondsString;
      } else {
        digitalTime += minutesString.length < 2 ? '0' + minutesString : minutesString;
      }
      digitalTime += ' ' + ampm;
      this.shadowRoot.querySelector('.digitalClock').textContent = digitalTime;
    }
  }

  _runDate() {
    const now = moment();
    now.locale(this.hass.language);
    this.shadowRoot.querySelector('.date').textContent = now.format(this.dateFormat);
  }

  _runWeather() {
    if (!this.weather || !this.weatherEntity || !this.hass.states[this.weatherEntity]) {
      return;
    }
  
    const weatherState = this.hass.states[this.weatherEntity];
    const weatherIcon = this.shadowRoot.querySelector('.meteo-icon');
    const weatherTemp = this.shadowRoot.querySelector('.weather-temp');
    const weatherDesc = this.shadowRoot.querySelector('.weather-desc');

    if (weatherIcon && weatherTemp && weatherDesc) {

    // Get the icon URL
    const iconUrl = weatherIconUrls[weatherState.state] || weatherIconUrls['sunny'];
    
    // Use img tag to display the SVG
    weatherIcon.innerHTML = `<img src="${iconUrl}" alt="${weatherState.state}" class="weather-svg-icon">`;
  
      // Set temperature
      const temp = Math.round(weatherState.attributes.temperature);
      const unit = this.weatherFormat === 'temperature_unit' 
        ? weatherState.attributes.unit_of_measurement || '°C'
        : (this.weatherFormat || '°C');
      weatherTemp.textContent = `${temp}${unit}`;
  
      // Set description  
      weatherDesc.textContent = this._formatWeatherCondition(weatherState.state);
    }
  }

  _formatWeatherCondition(condition) {
    const conditionMapping = {
      'clear-night': 'Clear night',
      'cloudy': 'Cloudy',
      'fog': 'Fog',
      'hail': 'Hail',
      'lightning': 'Lightning',
      'lightning-rainy': 'Storm',
      'partlycloudy': 'Partly cloudy',
      'pouring': 'Pouring',
      'rainy': 'Rainy',
      'snowy': 'Snowy',
      'snowy-rainy': 'Sleet',
      'sunny': 'Sunny',
      'windy': 'Windy',
      'windy-variant': 'Very windy',
      'exceptional': 'Exceptional'
    };

    return conditionMapping[condition] || condition.charAt(0).toUpperCase() + condition.slice(1);
  }

  updateSidebarSize(root) {
    const sidebarInner = this.shadowRoot.querySelector('.sidebar-inner');
    const header = root.shadowRoot.querySelector('ch-header') || root.shadowRoot.querySelector('app-header');
    const offParam = getParameterByName('sidebarOff');
    let headerHeightPx = getHeaderHeightPx();
    
    if (sidebarInner) {
      sidebarInner.style.width = this.offsetWidth + 'px';
      if(this.config.hideTopMenu) {
        sidebarInner.style.height = `${window.innerHeight}px`;
        sidebarInner.style.top = '0px';
      } else {
        sidebarInner.style.height = `calc(${window.innerHeight}px - `+headerHeightPx+`)`;
        sidebarInner.style.top = headerHeightPx;
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  firstUpdated() {
    provideHass(this);
    let root = getRoot();
    if (!root) return;
    root.shadowRoot.querySelectorAll('paper-tab').forEach((paperTab) => {
      log2console('firstUpdated', 'Menu item found');
      paperTab.addEventListener('click', () => {
        this._updateActiveMenu();
      });
    });
    const self = this;
    if (this.clock || this.digitalClock) {
      const inc = 1000;
      self._runClock();
      setInterval(function() {
        self._runClock();
      }, inc);
    }
    if (this.date) {
      const inc = 1000 * 60 * 60;
      self._runDate();
      setInterval(function() {
        self._runDate();
      }, inc);
    }
    if (this.weather) {
      const inc = 1000 * 60 * 5; // Update every 5 minutes
      self._runWeather();
      setInterval(function() {
        self._runWeather();
      }, inc);
    }

    setTimeout(() => {
      self.updateSidebarSize(root);
      self._updateActiveMenu();
    }, 1);
    // The panel is position:fixed with a JS-measured px width, so a single
    // measurement at load can race the injected `#customSidebar { width: % }`
    // stylesheet and pin the panel too wide — its content then spills into the
    // separator until a hard refresh re-rolls the timing. Re-apply the width
    // whenever the column is (re)laid out so it always tracks the real column.
    if ('ResizeObserver' in window) {
      this._resizeObserver = new (window as any).ResizeObserver(() => {
        self.updateSidebarSize(root);
      });
      this._resizeObserver.observe(this);
    }
    window.addEventListener(
      'resize',
      function() {
        setTimeout(() => {
          self.updateSidebarSize(root);
        }, 1);
      },
      true
    );

    if (this.widgetCard) {
      setTimeout(async () => {
        const card = Object.assign({ type: this.widgetCard.type }, this.widgetCard.cardOptions);
        await this.createCard(card, '.widget-card', this.widgetCard);
      }, 100);
    }

    if (this.bottomCard) {
      setTimeout(async () => {
        const card = Object.assign({ type: this.bottomCard.type }, this.bottomCard.cardOptions);
        await this.createCard(card, '.bottom', this.bottomCard);
      }, 100);
    }
  }

  _updateActiveMenu() {
    if(this.updateMenu) {
      this.shadowRoot.querySelectorAll('ul.sidebarMenu li[data-type="navigate"]').forEach((menuItem) => {
        menuItem.classList.remove('active');
      });
      let activeEl = this.shadowRoot.querySelector('ul.sidebarMenu li[data-path="' + document.location.pathname + '"]');
      if (activeEl) {
        activeEl.classList.add('active');
      }
    }
  }

  _menuAction(e) {
    if ((e.target.dataset && e.target.dataset.menuitem) || (e.target.parentNode.dataset && e.target.parentNode.dataset.menuitem)) {
      const menuItem = JSON.parse(e.target.dataset.menuitem || e.target.parentNode.dataset.menuitem);
      this._customAction(menuItem);
      this._updateActiveMenu();
    }
  }

  _customAction(tapAction) {
    switch (tapAction.action) {
      case 'more-info':
        if (tapAction.entity || tapAction.camera_image) {
          moreInfo(tapAction.entity ? tapAction.entity : tapAction.camera_image!);
        }
        break;
      case 'navigate':
        if (tapAction.navigation_path) {
          navigate(window, tapAction.navigation_path);
        }
        break;
      case 'url':
        if (tapAction.url_path) {
          window.open(tapAction.url_path);
        }
        break;
      case 'toggle':
        if (tapAction.entity) {
          toggleEntity(this.hass, tapAction.entity!);
          forwardHaptic('success');
        }
        break;
      case 'call-service': {
        if (!tapAction.service) {
          forwardHaptic('failure');
          return;
        }
        const [domain, service] = tapAction.service.split('.', 2);
        this.hass.callService(domain, service, tapAction.service_data);
        forwardHaptic('success');
      }
    }
  }

  setConfig(config) {
    this.config = config;

    if (this.config.template) {
      subscribeRenderTemplate(
        null,
        (res) => {
          const regex = /<(?:li|div)(?:\s+(?:class|id)\s*=\s*"([^"]*)")*\s*>([^<]*)<\/(?:li|div)>/g
          this.templateLines = res.match(regex).map( (val) => val);
          this.requestUpdate();
        },
        {
          template: this.config.template,
          variables: { config: this.config },
          entity_ids: this.config.entity_ids,
        }
      );
    }
  }

  getCardSize() {
    return 1;
  }

  static get styles() {
    return css`
      :host {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        // --face-color: #FFF;
        // --face-border-color: #FFF;
        // --clock-hands-color: #000;
        // --clock-seconds-hand-color: #FF4B3E;
        // --clock-middle-background: #FFF;
        // --clock-middle-border: #000;
        // --sidebar-background: #FFF;
        // --sidebar-text-color: #000;
        // --sidebar-icon-color: #000;
        // --sidebar-selected-text-color: #000;
        // --sidebar-selected-icon-color: #000;
        background-color:  var(--sidebar-background, var(--paper-listbox-background-color, var(--primary-background-color, #fff)));
      }

      .sidebar-inner {
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: fixed;
        width: 0;
        overflow: hidden auto;
      }

      .sidebarMenu {
        list-style: none;
        padding: 0;
        border-top: none;
        border-bottom: none;
      }

      .sidebarMenu li {
        color: var(--sidebar-text-color);
        position: relative;
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 15px;
        line-height: 20px;
        font-weight: 500;
        white-space: normal;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 4px;
        background: transparent;
        border: 1px solid transparent;
      }

      .sidebarMenu li:hover {
        background-color: rgba(255, 255, 255, 0.06);
        border-color: var(--sidebar-border-color);
        transform: translateX(2px);
      }

      .sidebarMenu li ha-icon {
        color: var(--sidebar-icon-color);
        --mdc-icon-size: 20px;
        margin-left: auto;
        flex-shrink: 0;
        transition: color 0.3s ease, transform 0.3s ease;
      }

      .sidebarMenu li:hover ha-icon {
        color: var(--sidebar-selected-icon-color);
        transform: scale(1.1);
      }

      .sidebarMenu li.active {
        color: var(--sidebar-selected-text-color);
        background: var(--sidebar-selected-background);
        border-color: rgba(96, 165, 250, 0.3);
        box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
        transform: translateX(4px);
      }

      .sidebarMenu li.active::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--sidebar-selected-icon-color, #000);
        opacity: 0.12;
        border-radius: 12px;
      }

      .sidebarMenu li.active ha-icon {
        color: var(--sidebar-selected-icon-color);
      }

      .sidebarMenu li span {
        flex: 1;
        margin-right: 12px;
      }

      /* Header Styles */
      h1 {
        margin-top: 15px;
        margin-bottom: 16px;
        font-size: 42px;
        line-height: 48px;
        font-weight: 300;
        color: var(--sidebar-text-color);
        cursor: default;
        letter-spacing: -0.025em;
      }

      h1.digitalClock {
        font-size: 72px;
        line-height: 56px;
        font-weight: 200;
        cursor: default;
        letter-spacing: -0.03em;
        color: #ffffff;
        text-align: center;
      }

      h1.digitalClock.with-seconds {
        font-size: 42px;
        line-height: 48px;
        cursor: default;
      }

      h1.digitalClock.with-title {
        margin-bottom: 8px;
        cursor: default;
      }

      h2 {
        margin: 0 0 20px 0;
        font-size: 16px;
        line-height: 20px;
        font-weight: 400;
        color: var(--sidebar-text-color);
        cursor: default;
        opacity: 0.8;
      }

      h2.date {
        font-size: 24px;
        text-align: center;
        line-height: 32px;
      }

      /* Template Section */
      .template {
        margin: 20px 0;
        padding: 20px;
        list-style: none;
        color: var(--sidebar-text-color);
        background: var(--sidebar-card-background);
        border: 1px solid var(--sidebar-border-color);
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      .template li {
        display: block;
        color: inherit;
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;
        white-space: normal;
        margin-bottom: 8px;
      }

      .template li:last-child {
        margin-bottom: 0;
      }

      /* Weather Widget */
      .weather-widget {
        display: flex;
        align-items: center;
        margin: 0 0 24px 0;
        padding: 20px;
        background: var(--sidebar-card-background);
        border: 1px solid var(--sidebar-border-color);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        color: var(--sidebar-text-color);
        cursor: default;
        transition: all 0.3s ease;
      }

      .weather-widget:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(96, 165, 250, 0.3);
      }

      .weather-icon {
        margin-right: 16px;
        width: 56px;
        height: 56px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(96, 165, 250, 0.1);
        border-radius: 10px;
        padding: 8px;
      }

      .meteo-icon {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .weather-svg-icon {
        width: 40px !important;
        height: 40px !important;
        object-fit: contain;
        display: block;
        filter: brightness(0) saturate(100%) invert(65%) sepia(78%) saturate(3893%) hue-rotate(200deg) brightness(104%) contrast(97%);
      }

      .weather-info {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .weather-temp {
        font-size: 24px;
        font-weight: 500;
        line-height: 28px;
        margin-bottom: 2px;
        color: #ffffff;
      }

      .weather-desc {
        font-size: 14px;
        font-weight: 400;
        opacity: 0.8;
        line-height: 16px;
      }

      /* Clock Styles */
      .clock {
        margin: 20px auto 28px auto;
        position: relative;
        padding-top: 55%;
        width: 55%;
        border-radius: 100%;
        background: rgba(255, 255, 255, 0.08);
        font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
        border: 2px solid var(--sidebar-border-color);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .clock .wrap {
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 100%;
      }

      .clock .minute,
      .clock .hour {
        position: absolute;
        height: 28%;
        width: 3px;
        margin: auto;
        top: -27%;
        left: 0;
        bottom: 0;
        right: 0;
        background: #e1e5e9;
        transform-origin: bottom center;
        transform: rotate(0deg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        z-index: 1;
        border-radius: 2px;
      }

      .clock .minute {
        position: absolute;
        height: 38%;
        width: 2px;
        top: -35%;
        left: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        transform: rotate(90deg);
      }

      .clock .second {
        position: absolute;
        top: -45%;
        height: 45%;
        width: 1px;
        margin: auto;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: 1px;
        background: #60a5fa;
        transform-origin: bottom center;
        transform: rotate(180deg);
        z-index: 1;
      }

      .clock .dot {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 8px;
        height: 8px;
        border-radius: 100px;
        background: #60a5fa;
        border: 2px solid #1a1a1a;
        margin: auto;
        z-index: 2;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }

      /* Notifications Styles */
      .notifications-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 16px 0;
      }

      .notification-card {
        background: var(--sidebar-card-background);
        border-radius: 12px;
        padding: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid var(--sidebar-border-color);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      }

      .notification-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(96, 165, 250, 0.3);
      }

      .no-notifications {
        text-align: center;
        padding: 24px 16px;
      }

      .no-notifications-title {
        color: var(--sidebar-text-color);
        margin: 8px 0 4px 0;
        font-size: 16px;
        font-weight: 500;
      }

      .no-notifications-subtitle {
        color: var(--sidebar-icon-color);
        margin: 0;
        font-size: 14px;
      }

      .notification-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .notification-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .notification-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .notification-icon.error {
        color: #ef4444;
      }

      .notification-icon.info {
        color: #60a5fa;
      }

      .notification-icon.success {
        color: #10b981;
      }

      .notification-icon.warning {
        color: #f59e0b;
      }

      .notification-title {
        color: var(--sidebar-text-color);
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
      }

      .dismiss-icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
      }

      .dismiss-icon-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .dismiss-icon-btn svg {
        width: 16px;
        height: 16px;
        color: var(--sidebar-icon-color);
      }

      .dismiss-icon-btn:hover svg {
        color: var(--sidebar-text-color);
      }

      .notification-message {
        color: var(--sidebar-text-color);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 12px;
        opacity: 0.9;
      }

      .notification-message .bullet-point {
        margin-left: 16px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 4px;
      }

      .notification-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .notification-time {
        color: var(--sidebar-icon-color);
        font-size: 12px;
      }

      .dismiss-btn {
        background: #60a5fa;
        color: #ffffff;
        border: none;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dismiss-btn:hover {
        background: #3b82f6;
        transform: translateY(-1px);
      }

      .dismiss-all-container {
        text-align: center;
        padding-top: 8px;
      }

      .dismiss-all-btn {
        background: none;
        border: none;
        color: var(--sidebar-icon-color);
        font-size: 14px;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .dismiss-all-btn:hover {
        color: var(--sidebar-text-color);
      }


      /* Widget Card */
      .widget-card {
        display: flex;
        padding: 15px;
        background: var(--sidebar-card-background);
        border: 1px solid var(--sidebar-border-color);
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      /* Bottom Card */
      .bottom {
        display: flex;
        margin-top: auto;
        padding: 15px;
        background: var(--sidebar-card-background);
        border: 1px solid var(--sidebar-border-color);
        border-radius: 12px;
        backdrop-filter: blur(10px);
      }

      /* Scrollbar styling */
      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(96, 165, 250, 0.3);
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: rgba(96, 165, 250, 0.5);
      }
    `;
  }
}

customElements.define('sidebar-card', SidebarCard);

// ##########################################################################################
// ###   The default CSS of the Sidebar Card element
// ##########################################################################################

function createCSS(sidebarConfig: any, width: number) {
  let sidebarWidth = 25;
  let contentWidth = 75;
  let sidebarResponsive = false;
  let headerHeightPx = getHeaderHeightPx();
  if (sidebarConfig.width) {
    if (typeof sidebarConfig.width == 'number') {
      sidebarWidth = sidebarConfig.width;
      contentWidth = 100 - sidebarWidth;
    } else if (typeof sidebarConfig.width == 'object') {
      sidebarWidth = sidebarConfig.desktop;
      contentWidth = 100 - sidebarWidth;
      sidebarResponsive = true;
    }
  }
  // create css
  let css = `
    #customSidebarWrapper { 
      display:flex;
      flex-direction:row;
      overflow:hidden;
    }
    #customSidebar.hide {
      display:none!important;
      width:0!important;
    }
    #view.hideSidebar {
      width:100%!important;
    }
  `;
  if (sidebarResponsive) {
    if (width <= sidebarConfig.breakpoints.mobile) {
      if (sidebarConfig.width.mobile == 0) {
        css +=
          `
          #customSidebar {
            width:` +
          sidebarConfig.width.mobile +
          `%;
            overflow:hidden;
            display:none;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
          } 
          #view {
            width:` +
          (100 - sidebarConfig.width.mobile) +
          `%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      } else {
        css +=
          `
          #customSidebar {
            width:` +
          sidebarConfig.width.mobile +
          `%;
            overflow:hidden;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
          } 
          #view {
            width:` +
          (100 - sidebarConfig.width.mobile) +
          `%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      }
    } else if (width <= sidebarConfig.breakpoints.tablet) {
      if (sidebarConfig.width.tablet == 0) {
        css +=
          `
          #customSidebar {
            width:` +
          sidebarConfig.width.tablet +
          `%;
            overflow:hidden;
            display:none;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
          } 
          #view {
            width:` +
          (100 - sidebarConfig.width.tablet) +
          `%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      } else {
        css +=
          `
          #customSidebar {
            width:` +
          sidebarConfig.width.tablet +
          `%;
            overflow:hidden;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
          } 
          #view {
            width:` +
          (100 - sidebarConfig.width.tablet) +
          `%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      }
    } else {
      if (sidebarConfig.width.desktop == 0) {
        css +=
          `
          #customSidebar {
            width:` +
          sidebarConfig.width.desktop +
          `%;
            overflow:hidden;
            display:none;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
          } 
          #view {
            width:` +
          (100 - sidebarConfig.width.desktop) +
          `%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      } else {
        css +=
          `
          #customSidebar {
            width:` +
          sidebarConfig.width.desktop +
          `%;
            overflow:hidden;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
          } 
          #view {
            width:` +
          (100 - sidebarConfig.width.desktop) +
          `%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      }
    }
  } else {
    css +=
      `
      #customSidebar {
        width:` +
      sidebarWidth +
      `%;
        overflow:hidden;
        ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc('+headerHeightPx+' + env(safe-area-inset-top));'}
      } 
      #view {
        width:` +
      contentWidth +
      `%;
      ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
      }
    `;
  }
  return css;
}

// ##########################################################################################
// ###   Helper methods
// ##########################################################################################

function getLovelace() {
  let root: any = document.querySelector('home-assistant');
  root = root && root.shadowRoot;
  root = root && root.querySelector('home-assistant-main');
  root = root && root.shadowRoot;
  root = root && root.querySelector('ha-drawer partial-panel-resolver');
  root = root && root.shadowRoot || root;
  root = root && root.querySelector('ha-panel-lovelace');
  root = root && root.shadowRoot;
  root = root && root.querySelector('hui-root');
  if (root) {
      const ll = root.lovelace;
      ll.current_view = root.___curView;
      return ll;
  }
  return null;
}

async function log2console(method: string, message: string, object?: any) {
  const lovelace = await getConfig();
  if (lovelace.config.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if (sidebarConfig.debug === true) {
      console.info(`%c${SIDEBAR_CARD_TITLE}: %c ${method.padEnd(24)} -> %c ${message}`, 'color: chartreuse; background: black; font-weight: 700;', 'color: yellow; background: black; font-weight: 700;', '', object);
    }
  }
}

async function error2console(method: string, message: string, object?: any) {
  const lovelace = await getConfig();
  if (lovelace.config.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if (sidebarConfig.debug === true) {
      console.error(`%c${SIDEBAR_CARD_TITLE}: %c ${method.padEnd(24)} -> %c ${message}`, 'color: red; background: black; font-weight: 700;', 'color: white; background: black; font-weight: 700;', 'color:red', object);
    }
  }
}

// Returns the root element
function getRoot() {
  let root: any = document.querySelector('home-assistant');
  root = root && root.shadowRoot;
  root = root && root.querySelector('home-assistant-main');
  root = root && root.shadowRoot;
  root = root && root.querySelector('ha-drawer partial-panel-resolver');
  root = (root && root.shadowRoot) || root;
  root = root && root.querySelector('ha-panel-lovelace');
  root = root && root.shadowRoot;
  root = root && root.querySelector('hui-root');

  return root;
}

// return var(--header-height) from #view element
// We need to take from the div#view element in case of "kiosk-mode" module installation that defined new CSS var(--header-height) as local new variable, not available in div#customSidebar
function getHeaderHeightPx() {
	let headerHeightPx = '0px';
	const root = getRoot();
    const view = root.shadowRoot.getElementById('view');
	//debugger;
	if(view!==undefined && window.getComputedStyle(view)!==undefined) {
		headerHeightPx = window.getComputedStyle(view).paddingTop;
	}
    return headerHeightPx;
}

// Returns the Home Assistant Sidebar element
function getSidebar() {
  let sidebar: any = document.querySelector('home-assistant');
  sidebar = sidebar && sidebar.shadowRoot;
  sidebar = sidebar && sidebar.querySelector('home-assistant-main');
  sidebar = sidebar && sidebar.shadowRoot;
  sidebar = sidebar && sidebar.querySelector('ha-drawer ha-sidebar');

  return sidebar;
}

// Returns the Home Assistant app-drawer layout element
function getAppDrawerLayout() {
  let appDrawerLayout: any = document.querySelector('home-assistant');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('home-assistant-main');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('ha-drawer'); // ha-drawer
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('.mdc-drawer-app-content');

  return appDrawerLayout;
}

// Returns the Home Assistant app-drawer element
function getAppDrawer() {
  let appDrawer: any = document.querySelector('home-assistant');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('home-assistant-main');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('ha-drawer'); // ha-drawer
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('.mdc-drawer');

  return appDrawer;
}

// Returns a query parameter by its name
function getParameterByName(name: string, url = window.location.href) {
  const parameterName = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + parameterName + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// hides (if requested) the HA header, HA footer and/or HA sidebar and hides this sidebar if configured so
function updateStyling(appLayout: any, sidebarConfig: any) {
  const width = document.body.clientWidth;
  appLayout.querySelector('#customSidebarStyle').textContent = createCSS(sidebarConfig, width);

  const root = getRoot();
  const hassHeader = root.shadowRoot.querySelector('.header');
  log2console('updateStyling', hassHeader ? 'Home Assistant header found!' : 'Home Assistant header not found!');
  const hassFooter = root.shadowRoot.querySelector('ch-footer' || root.shadowRoot.querySelector('app-footer'));
  log2console('updateStyling', hassFooter ? 'Home Assistant footer found!' : 'Home Assistant footer not found!');
  const offParam = getParameterByName('sidebarOff');
  const view = root.shadowRoot.getElementById('view');
  let headerHeightPx = getHeaderHeightPx();

  if (sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && sidebarConfig.showTopMenuOnMobile && sidebarConfig.showTopMenuOnMobile === true && width <= sidebarConfig.breakpoints.mobile && offParam == null) {
    if (hassHeader) {
      log2console('updateStyling', 'Action: Show Home Assistant header!');
      hassHeader.style.display = 'block';
    }
    if (view) {
      view.style.minHeight = 'calc(100vh - '+headerHeightPx+')';
    }
    if (hassFooter) {
      log2console('updateStyling', 'Action: Show Home Assistant footer!');
      hassFooter.style.display = 'flex';
    }
  } else if (sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && offParam == null) {
    if (hassHeader) {
      log2console('updateStyling', 'Action: Hide Home Assistant header!');
      hassHeader.style.display = 'none';
    }
    if (hassFooter) {
      log2console('updateStyling', 'Action: Hide Home Assistant footer!');
      hassFooter.style.display = 'none';
    }
    if (view) {
      view.style.minHeight = 'calc(100vh)';
    }
  }
}

// watch and handle the resize and location-changed events
function subscribeEvents(appLayout: any, sidebarConfig: any, contentContainer: any, sidebar: any) {
  window.addEventListener(
    'resize',
    function() {
      updateStyling(appLayout, sidebarConfig);
    },
    true
  );

  if ('hideOnPath' in sidebarConfig) {
    window.addEventListener('location-changed', () => {
      if (sidebarConfig.hideOnPath.includes(window.location.pathname)) {
        contentContainer.classList.add('hideSidebar');
        sidebar.classList.add('hide');
      } else {
        contentContainer.classList.remove('hideSidebar');
        sidebar.classList.remove('hide');
      }
    });

    if (sidebarConfig.hideOnPath.includes(window.location.pathname)) {
      log2console('subscribeEvents', 'Disable sidebar for this path');
      contentContainer.classList.add('hideSidebar');
      sidebar.classList.add('hide');
    }
  }
}

function watchLocationChange() {
  setTimeout(() => {
    window.addEventListener('location-changed', () => {
      const root = getRoot();
      if (!root) return; // location changed before finishing dom rendering
      const appLayout = root.shadowRoot.querySelector('div');
      const customSidebarWrapper = appLayout.querySelector('#customSidebarWrapper');
      if (!customSidebarWrapper) {
        buildSidebar();
      } else {
        const customSidebar = customSidebarWrapper.querySelector('#customSidebar');
        if (!customSidebar) {
          buildSidebar();
        }
      }
    });
  }, 1000);
}

// build the custom sidebar card
async function buildCard(sidebar: any, config: any) {
  const sidebarCard = document.createElement('sidebar-card') as SidebarCard;
  sidebarCard.setConfig(config);
  sidebarCard.hass = hass();

  sidebar.appendChild(sidebarCard);
}

// non-blocking sleep function
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// gets the lovelace config
async function getConfig() {
  let lovelace: any;
  while (!lovelace) {
    lovelace = getLovelace();
    if (!lovelace) {
      await sleep(500);
    }
  }

  return lovelace;
}

function createElementFromHTML(htmlString: string) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

// ##########################################################################################
// ###   The Sidebar Card code base initialisation
// ##########################################################################################

async function buildSidebar() {
  const lovelace = await getConfig();
  if (lovelace.config.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if (!sidebarConfig.width || (sidebarConfig.width && typeof sidebarConfig.width == 'number' && sidebarConfig.width > 0 && sidebarConfig.width < 100) || (sidebarConfig.width && typeof sidebarConfig.width == 'object')) {
      const root = getRoot();
      const hassSidebar = getSidebar();
      const appDrawerLayout = getAppDrawerLayout();
      const appDrawer = getAppDrawer();
      const offParam = getParameterByName('sidebarOff');

      if (sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && offParam == null) {
        if (root.shadowRoot.querySelector('ch-header')) root.shadowRoot.querySelector('ch-header').style.display = 'none';
        if (root.shadowRoot.querySelector('app-header')) root.shadowRoot.querySelector('app-header').style.display = 'none';
        if (root.shadowRoot.querySelector('ch-footer')) root.shadowRoot.querySelector('ch-footer').style.display = 'none';
        if (root.shadowRoot.getElementById('view')) root.shadowRoot.getElementById('view').style.minHeight = 'calc(100vh)';
      }
      if (sidebarConfig.hideHassSidebar && sidebarConfig.hideHassSidebar === true && offParam == null) {
        if (hassSidebar) {
          hassSidebar.style.display = 'none';
        }
        if (appDrawerLayout) {
          appDrawerLayout.style.marginLeft = '0';
          appDrawerLayout.style.paddingLeft = '0';
        }
        if (appDrawer) {
          appDrawer.style.display = 'none';
        }
      }
      if (!sidebarConfig.breakpoints) {
        sidebarConfig.breakpoints = {
          tablet: 1024,
          mobile: 768,
        };
      } else if (sidebarConfig.breakpoints) {
        if (!sidebarConfig.breakpoints.mobile) {
          sidebarConfig.breakpoints.mobile = 768;
        }
        if (!sidebarConfig.breakpoints.tablet) {
          sidebarConfig.breakpoints.tablet = 1024;
        }
      }

      let appLayout = root.shadowRoot.querySelector('div');
      let css = createCSS(sidebarConfig, document.body.clientWidth);
      let style: any = document.createElement('style');
      style.setAttribute('id', 'customSidebarStyle');
      appLayout.appendChild(style);
      style.type = 'text/css';
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      // get element to wrap
      let contentContainer = appLayout.querySelector('#view');
      // create wrapper container
      const wrapper = document.createElement('div');
      wrapper.setAttribute('id', 'customSidebarWrapper');
      // insert wrapper before el in the DOM tree
      contentContainer.parentNode.insertBefore(wrapper, contentContainer);
      // move el into wrapper
      let sidebar = document.createElement('div');
      sidebar.setAttribute('id', 'customSidebar');
      wrapper.appendChild(sidebar);
      wrapper.appendChild(contentContainer);
      await buildCard(sidebar, sidebarConfig);
      //updateStyling(appLayout, sidebarConfig);
      subscribeEvents(appLayout, sidebarConfig, contentContainer, sidebar);
      setTimeout(function() {
        updateStyling(appLayout, sidebarConfig);
      }, 1);
    } else {
      error2console('buildSidebar', 'Error sidebar in width config!');
    }
  } else {
    log2console('buildSidebar', 'No sidebar in config found!');
  }
}

  // show console message on init
console.info(
  `%c  ${SIDEBAR_CARD_TITLE.padEnd(24)}%c
  Version: ${SIDEBAR_CARD_VERSION.padEnd(9)}      `,
  'color: chartreuse; background: black; font-weight: 700;',
  'color: white; background: dimgrey; font-weight: 700;'
);

buildSidebar();
watchLocationChange();
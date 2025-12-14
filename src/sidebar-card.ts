// ------------------------------------------------------------------------------------------
//  SIDEBAR-CARD
// ------------------------------------------------------------------------------------------
//  Original version: https://github.com/DBuit/sidebar-card
// ------------------------------------------------------------------------------------------
//  Mod version: https://github.com/Bobsilvio/sidebar-card

// ##########################################################################################
// ###   Global constants
// ##########################################################################################

const SIDEBAR_CARD_TITLE = 'SIDEBAR-CARD';
const SIDEBAR_CARD_VERSION = '2.0.0';

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
// ###   The actual Sidebar Card element
// ##########################################################################################

class SidebarCard extends LitElement {
  /* **************************************** *
   * Element's local properties        *
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
  bottomCard: any = null;
  CUSTOM_TYPE_PREFIX = 'custom:';

  _clockInterval: any = null;
  _dateInterval: any = null;
  _boundLocationChange: any;

  /* **************************************** *
   * Element's public properties       *
   * **************************************** */

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {},
    };
  }

  /* **************************************** *
   * Element constructor            *
   * **************************************** */

  constructor() {
    super();
    this._boundLocationChange = () => {
      setTimeout(() => this._updateActiveMenu(), 50);
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('location-changed', this._boundLocationChange);

    if (!this.config) {
      return;
    }

    const self = this;

    if ((this.config.clock || this.config.digitalClock) && !this._clockInterval) {
      const inc = 1000;
      setTimeout(() => self._runClock(), 50);
      this._clockInterval = setInterval(() => {
        self._runClock();
      }, inc);
    }

    if (this.config.date && !this._dateInterval) {
      const inc = 1000 * 60 * 60;
      setTimeout(() => self._runDate(), 50);
      this._dateInterval = setInterval(() => {
        self._runDate();
      }, inc);
    }

    this._updateActiveMenu();
  }

  /* **************************************** *
   * Element's HTML renderer (lit-element)  *
   * **************************************** */

  render() {
    const sidebarMenu = this.config.sidebarMenu;
    const title = 'title' in this.config ? this.config.title : false;
    const addStyle = 'style' in this.config;

    const menuStyle = this.config.menuStyle || 'list';

    this.clock = this.config.clock ? this.config.clock : false;
    this.digitalClock = this.config.digitalClock ? this.config.digitalClock : false;
    this.digitalClockWithSeconds = this.config.digitalClockWithSeconds
      ? this.config.digitalClockWithSeconds
      : false;
    this.twelveHourVersion = this.config.twelveHourVersion
      ? this.config.twelveHourVersion
      : false;
    this.period = this.config.period ? this.config.period : false;
    this.date = this.config.date ? this.config.date : false;
    this.dateFormat = this.config.dateFormat ? this.config.dateFormat : 'DD MMMM';
    this.bottomCard = this.config.bottomCard ? this.config.bottomCard : null;
    this.updateMenu = this.config.hasOwnProperty('updateMenu')
      ? this.config.updateMenu
      : true;

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
              <h1
                class="digitalClock${title ? ' with-title' : ''}${
                  this.digitalClockWithSeconds ? ' with-seconds' : ''
                }"
              ></h1>
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
        ${sidebarMenu && sidebarMenu.length > 0
          ? html`
              <ul
                class="sidebarMenu
                ${menuStyle === 'buttons' ? 'sidebarMenu--buttons' : ''}
                ${menuStyle === 'wide' ? 'sidebarMenu--wide' : ''}
                ${menuStyle === 'grid' ? 'sidebarMenu--grid' : ''}"
              >
                ${(sidebarMenu || [])
                  .filter((item) => this._evaluateVisibleCondition(item.conditional, this.hass))
                  .map((sidebarMenuItem) => {
                    const isActive =
                      sidebarMenuItem.state &&
                      this.hass.states[sidebarMenuItem.state] &&
                      this.hass.states[sidebarMenuItem.state].state != 'off' &&
                      this.hass.states[sidebarMenuItem.state].state != 'unavailable';

                    const bg = sidebarMenuItem.background_color || '';
                    const iconColor = sidebarMenuItem.icon_color || '';

                    const styleStr = `
                      ${
                        bg
                          ? `--sidebar-button-bg:${bg};--sidebar-wide-bg:${bg};--sidebar-grid-bg:${bg};`
                          : ''
                      }
                      ${
                        iconColor
                          ? `--sidebar-button-icon-color:${iconColor};--sidebar-wide-icon-color:${iconColor};--sidebar-grid-icon-color:${iconColor};`
                          : ''
                      }
                    `;

                    // === STILE "buttons"
                    if (menuStyle === 'buttons') {
                      const withLabel = this.config.showLabel === true;
                      return html`
                        <li
                          @click="${(ev: Event) => this._menuAction(ev)}"
                          class="sidebar-item-button ${withLabel
                            ? 'sidebar-item-button--with-label'
                            : ''} ${isActive ? 'active' : ''}"
                          data-type="${sidebarMenuItem.action}"
                          data-path="${sidebarMenuItem.navigation_path
                            ? sidebarMenuItem.navigation_path
                            : ''}"
                          data-menuitem="${JSON.stringify(sidebarMenuItem)}"
                          style="${styleStr}"
                        >
                          <div class="sidebar-icon-wrapper">
                            ${sidebarMenuItem.icon
                              ? html`
                                  <ha-icon
                                    class="sidebar-icon"
                                    icon="${sidebarMenuItem.icon}"
                                  ></ha-icon>
                                `
                              : html``}
                          </div>
                          ${withLabel
                            ? html`<span class="sidebar-label">${sidebarMenuItem.name}</span>`
                            : html``}
                        </li>
                      `;
                    }

                    // === STILE "wide"
                    if (menuStyle === 'wide') {
                      return html`
                        <li
                          @click="${(ev: Event) => this._menuAction(ev)}"
                          class="sidebar-item-wide ${isActive ? 'active' : ''}"
                          data-type="${sidebarMenuItem.action}"
                          data-path="${sidebarMenuItem.navigation_path
                            ? sidebarMenuItem.navigation_path
                            : ''}"
                          data-menuitem="${JSON.stringify(sidebarMenuItem)}"
                          style="${styleStr}"
                        >
                          ${sidebarMenuItem.icon
                            ? html`
                                <ha-icon
                                  class="sidebar-icon"
                                  icon="${sidebarMenuItem.icon}"
                                ></ha-icon>
                              `
                            : html``}
                          <span class="sidebar-label">${sidebarMenuItem.name}</span>
                        </li>
                      `;
                    }

                    // === STILE "grid"
                    if (menuStyle === 'grid') {
                      return html`
                        <li
                          @click="${(ev: Event) => this._menuAction(ev)}"
                          class="sidebar-item-grid ${isActive ? 'active' : ''}"
                          data-type="${sidebarMenuItem.action}"
                          data-path="${sidebarMenuItem.navigation_path
                            ? sidebarMenuItem.navigation_path
                            : ''}"
                          data-menuitem="${JSON.stringify(sidebarMenuItem)}"
                          style="${styleStr}"
                        >
                          <div class="sidebar-icon-wrapper sidebar-icon-wrapper-grid">
                            ${sidebarMenuItem.icon
                              ? html`
                                  <ha-icon
                                    class="sidebar-icon"
                                    icon="${sidebarMenuItem.icon}"
                                  ></ha-icon>
                                `
                              : html``}
                          </div>
                          <span class="sidebar-label">${sidebarMenuItem.name}</span>
                        </li>
                      `;
                    }

                    // === Stile "list" originale (fallback)
                    return html`
                      <li
                        @click="${(ev: Event) => this._menuAction(ev)}"
                        class="${isActive ? 'active' : ''}"
                        data-type="${sidebarMenuItem.action}"
                        data-path="${sidebarMenuItem.navigation_path
                          ? sidebarMenuItem.navigation_path
                          : ''}"
                        data-menuitem="${JSON.stringify(sidebarMenuItem)}"
                      >
                        <span>${sidebarMenuItem.name}</span>
                        ${sidebarMenuItem.icon
                          ? html`
                              <ha-icon
                                @click="${(ev: Event) => this._menuAction(ev)}"
                                icon="${sidebarMenuItem.icon}"
                              ></ha-icon>
                            `
                          : html``}
                      </li>
                    `;
                  })}
              </ul>
            `
          : html``}

        ${this.config.template
          ? html`
              <ul class="template">
                ${this.templateLines.map((line) => {
                  return html`${createElementFromHTML(line)}`;
                })}
              </ul>
            `
          : html``}
        ${this.bottomCard
          ? html`
              <div class="bottom"></div>
            `
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
      this.shadowRoot.querySelector('.digitalClock').textContent = digitalTime;
    } else if (this.digitalClock && this.twelveHourVersion && this.period) {
      const ampm = realHours >= 12 ? 'pm' : 'am';
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
    if (!this.shadowRoot) return;
    const dateEl = this.shadowRoot.querySelector('.date');
    if (!dateEl) return;

    const now = moment();
    const lang =
      (this.hass && this.hass.language) || navigator.language || 'en';
    now.locale(lang);
    (dateEl as HTMLElement).textContent = now.format(this.dateFormat);
  }


  updateSidebarSize() {
    const sidebarInner = this.shadowRoot?.querySelector('.sidebar-inner') as HTMLElement | null;
    if (!sidebarInner) return;

    const root = getRoot(); // lo prendo qui
    const headerHeightPx = getHeaderHeightPx();

    sidebarInner.style.width = this.offsetWidth + 'px';

    if (this.config.hideTopMenu) {
      sidebarInner.style.height = `${window.innerHeight}px`;
      sidebarInner.style.top = '0px';
    } else {
      sidebarInner.style.height = `calc(${window.innerHeight}px - ${headerHeightPx})`;
      sidebarInner.style.top = headerHeightPx;
    }
  }
  

  firstUpdated() {
    provideHass(this);

    const self = this;

    setTimeout(() => {
      self.updateSidebarSize();
      self._updateActiveMenu();
    }, 50);

    setTimeout(() => {
      self.updateSidebarSize();
    }, 350);

    window.addEventListener(
      'resize',
      () => {
        setTimeout(() => {
          self.updateSidebarSize();
        }, 1);
      },
      true,
    );

    if (this.bottomCard) {
      setTimeout(() => {
        let card: any = {
          type: this.bottomCard.type,
        };
        card = Object.assign({}, card, this.bottomCard.cardOptions);
        log2console('firstUpdated', 'Bottom card: ', card);

        if (!card || typeof card !== 'object' || !card.type) {
          error2console('firstUpdated', 'Bottom card config error!');
          return;
        }

        let tag = card.type;
        if (tag.startsWith(this.CUSTOM_TYPE_PREFIX)) {
          tag = tag.substr(this.CUSTOM_TYPE_PREFIX.length);
        } else {
          tag = `hui-${tag}-card`;
        }

        const bottomSection = this.shadowRoot.querySelector('.bottom');
        if (!bottomSection) {
          error2console('firstUpdated', 'Bottom section not found');
          return;
        }

        const createAndAttachCard = () => {
          const cardElement: any = document.createElement(tag);

          if (typeof cardElement.setConfig !== 'function') {
            error2console(
              'firstUpdated',
              `Element "${tag}" for bottomCard does not implement setConfig(). Check type "${card.type}".`
            );
            return;
          }

          cardElement.setConfig(card);
          cardElement.hass = hass();
          (bottomSection as HTMLElement).appendChild(cardElement);
          provideHass(cardElement);

          if (this.bottomCard.cardStyle && this.bottomCard.cardStyle !== '') {
            const style = this.bottomCard.cardStyle;
            let itterations = 0;
            const interval = setInterval(() => {
              if (cardElement && cardElement.shadowRoot) {
                window.clearInterval(interval);
                const styleElement = document.createElement('style');
                styleElement.innerHTML = style;
                cardElement.shadowRoot.appendChild(styleElement);
              } else if (++itterations === 10) {
                window.clearInterval(interval);
              }
            }, 100);
          }
        };

        if (customElements.get(tag)) {
          createAndAttachCard();
        } else {
          customElements
            .whenDefined(tag)
            .then(createAndAttachCard)
            .catch((err) => {
              error2console('firstUpdated', `Error waiting for "${tag}" definition`, err);
            });
        }
      }, 2);
    }
  }

  _updateActiveMenu() {
    if (this.updateMenu) {
      this.shadowRoot
        .querySelectorAll('ul.sidebarMenu li[data-type="navigate"]')
        .forEach((menuItem) => {
          (menuItem as HTMLElement).classList.remove('active');
        });
      const activeEl = this.shadowRoot.querySelector(
        'ul.sidebarMenu li[data-path="' + document.location.pathname + '"]',
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.classList.add('active');
      }
    }
  }

  _menuAction(ev: Event) {
    const target = ev.target as HTMLElement | null;
    if (!target) return;

    const li = target.closest('li[data-menuitem]') as HTMLElement | null;
    if (!li) {
      return;
    }

    const menuItemStr = li.getAttribute('data-menuitem');
    if (!menuItemStr) {
      return;
    }

    const menuItem = JSON.parse(menuItemStr);
    this._customAction(menuItem);
  }

  _evaluateVisibleCondition(template: string | undefined, hassObj: any): boolean {
    if (!template) return true;

    const cleaned = template.trim().replace(/^{{\s*|\s*}}$/g, '').trim();

    try {
      const matchState = cleaned.match(
        /is_state\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
      );
      if (matchState) {
        const [, entityId, expected] = matchState;
        return hassObj.states[entityId]?.state === expected;
      }

      const matchAttr = cleaned.match(
        /is_state_attr\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
      );
      if (matchAttr) {
        const [, entityId, attr, expected] = matchAttr;
        return hassObj.states[entityId]?.attributes?.[attr] === expected;
      }

      const matchEquals = cleaned.match(
        /states\[['"]([^'"]+)['"]\]\s*==\s*['"]([^'"]+)['"]/,
      );
      if (matchEquals) {
        const [, entityId, expected] = matchEquals;
        return hassObj.states[entityId]?.state === expected;
      }

      const numericMatch = cleaned.match(
        /states\[['"]([^'"]+)['"]\]\s*\|\s*(int|float)\s*([<>]=?|==)\s*([\d.]+)/,
      );
      if (numericMatch) {
        const [, entityId, type, operator, thresholdStr] = numericMatch;
        const raw = hassObj.states[entityId]?.state;
        if (raw === undefined) return false;
        const num = type === 'float' ? parseFloat(raw) : parseInt(raw, 10);
        const threshold = parseFloat(thresholdStr);

        switch (operator) {
          case '>':
            return num > threshold;
          case '<':
            return num < threshold;
          case '>=':
            return num >= threshold;
          case '<=':
            return num <= threshold;
          case '==':
            return num == threshold;
          default:
            return false;
        }
      }

      console.warn('sidebar-card: could not parse visible template:', cleaned);
      return true;
    } catch (err) {
      console.error('sidebar-card: visible template evaluation error:', err);
      return true;
    }
  }

  _customAction(tapAction: any) {
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
        break;
      }

      case 'service-js': {
        if (tapAction.service) {
          try {
            const code = tapAction.service
              .toString()
              .replace(/^\[\[\[\s*|\s*\]\]\]$/g, '');
            const func = new Function(code);
            func.call(this);
            forwardHaptic('success');
          } catch (err) {
            forwardHaptic('failure');
          }
        } else {
          error2console('service-js', 'no service code found');
        }
        break;
      }
    }
  }

  setConfig(config: any) {
    this.config = config;

    if (this.config.template) {
      subscribeRenderTemplate(
        null,
        (res) => {
          const regex =
            /<(?:li|div)(?:\s+(?:class|id)\s*=\s*"([^"]*)")*\s*>([\s\S]*?)<\/(?:li|div)>/g;
          this.templateLines = res.match(regex).map((val) => val);
          this.requestUpdate();
        },
        {
          template: this.config.template,
          variables: { config: this.config },
          entity_ids: this.config.entity_ids,
        },
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
        background-color: var(
          --sidebar-background,
          var(--paper-listbox-background-color, var(--primary-background-color, #fff))
        );
      }
      .sidebar-inner {
        padding: 20px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: fixed;
        width: var(--sidebar-effective-width, 250px);
        max-width: 100%;
        overflow: hidden auto;
        transition: width 0.25s ease;
      }

      .sidebarMenu {
        list-style: none;
        margin: 20px 0;
        padding: 20px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
      .sidebarMenu li {
        color: var(--sidebar-text-color, #000);
        position: relative;
        padding: 10px 20px;
        border-radius: 12px;
        font-size: 18px;
        line-height: 24px;
        font-weight: 300;
        white-space: normal;
        display: block;
        cursor: pointer;
      }
      .sidebarMenu li ha-icon {
        float: right;
        color: var(--sidebar-icon-color, #000);
      }
      .sidebarMenu li.active {
        color: var(--sidebar-selected-text-color);
      }
      .sidebarMenu li.active ha-icon {
        color: var(--sidebar-selected-icon-color, rgb(247, 217, 89));
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
      h1 {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 32px;
        line-height: 32px;
        font-weight: 200;
        color: var(--sidebar-text-color, #000);
        cursor: default;
      }
      h1.digitalClock {
        font-size: 60px;
        line-height: 60px;
        cursor: default;
      }
      h1.digitalClock.with-seconds {
        font-size: 48px;
        line-height: 48px;
        cursor: default;
      }
      h1.digitalClock.with-title {
        margin-bottom: 0;
        cursor: default;
      }
      h2 {
        margin: 0;
        font-size: 26px;
        line-height: 26px;
        font-weight: 200;
        color: var(--sidebar-text-color, #000);
        cursor: default;
      }
      .template {
        margin: 0;
        padding: 0;
        list-style: none;
        color: var(--sidebar-text-color, #000);
      }

      .template li {
        display: block;
        color: inherit;
        font-size: 18px;
        line-height: 24px;
        font-weight: 300;
        white-space: normal;
      }

      .clock {
        margin: 20px 0;
        position: relative;
        padding-top: calc(100% - 10px);
        width: calc(100% - 10px);
        border-radius: 100%;
        background: var(--face-color, #fff);
        font-family: 'Montserrat';
        border: 5px solid var(--face-border-color, #fff);
        box-shadow: inset 2px 3px 8px 0 rgba(0, 0, 0, 0.1);
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
        width: 6px;
        margin: auto;
        top: -27%;
        left: 0;
        bottom: 0;
        right: 0;
        background: var(--clock-hands-color, #000);
        transform-origin: bottom center;
        transform: rotate(0deg);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);
        z-index: 1;
      }

      .clock .minute {
        position: absolute;
        height: 41%;
        width: 4px;
        top: -38%;
        left: 0;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.4);
        transform: rotate(90deg);
      }

      .clock .second {
        position: absolute;
        top: -48%;
        height: 48%;
        width: 2px;
        margin: auto;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: 4px;
        background: var(--clock-seconds-hand-color, #ff4b3e);
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
        width: 12px;
        height: 12px;
        border-radius: 100px;
        background: var(--clock-middle-background, #fff);
        border: 2px solid var(--clock-middle-border, #000);
        border-radius: 100px;
        margin: auto;
        z-index: 1;
      }

      .bottom {
        display: flex;
        margin-top: auto;
      }

      /* === STILE MENU "WIDE" === */

      .sidebarMenu.sidebarMenu--wide {
        border-top: none;
        border-bottom: none;
        margin: var(--sidebar-wide-margin-y, 16px) 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--sidebar-wide-gap, 8px);
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide {
        padding: 0 var(--sidebar-wide-padding-x, 14px);
        margin: 0;
        width: 100%;
        height: var(--sidebar-wide-height, 48px);
        border-radius: var(--sidebar-wide-radius, 18px);
        display: flex;
        align-items: center;
        gap: var(--sidebar-wide-item-gap, 10px);
        cursor: pointer;
        background-color: var(
          --sidebar-wide-bg,
          var(--sidebar-button-bg, rgba(255, 255, 255, 0.18))
        );
        box-sizing: border-box;
        position: relative;
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide ha-icon.sidebar-icon {
        color: var(--sidebar-wide-icon-color, var(--sidebar-icon-color, #000));
        width: var(--sidebar-wide-icon-size, 22px);
        height: var(--sidebar-wide-icon-size, 22px);
        flex-shrink: 0;
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide .sidebar-label {
        font-size: var(--sidebar-wide-font-size, 14px);
        line-height: var(--sidebar-wide-line-height, 1.2);
        color: var(--sidebar-wide-text-color, #111111);
        font-weight: var(--sidebar-wide-font-weight, 500);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide.active {
        position: relative;
        border: var(--sidebar-wide-active-border-width, 0px) solid
          var(--sidebar-wide-active-border-color, transparent);
        border-radius: var(--sidebar-wide-radius, 18px);
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide.active::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background-color: var(
          --sidebar-wide-active-bg,
          var(--sidebar-selected-bg, #111)
        );
        opacity: var(--sidebar-wide-active-opacity, 0.14);
        pointer-events: none;
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide.active ha-icon.sidebar-icon {
        color: var(
          --sidebar-wide-active-icon-color,
          var(--sidebar-selected-icon-color, rgb(247, 217, 89))
        );
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--sidebar-wide-active-icon-size, 26px) !important;
        height: var(--sidebar-wide-active-icon-size, 26px) !important;
        transform: none !important;
      }

      .sidebarMenu.sidebarMenu--wide li.sidebar-item-wide.active .sidebar-label {
        color: var(
          --sidebar-wide-active-text-color,
          var(--sidebar-wide-text-color, #111111)
        );
      }

      /* === STILE MENU "BUTTONS" === */

      .sidebarMenu.sidebarMenu--buttons {
        border-top: none;
        border-bottom: none;
        margin: var(--sidebar-button-margin-y, 16px) 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--sidebar-button-gap, 8px);
        align-items: stretch;
      }

      .sidebarMenu.sidebarMenu--buttons li.sidebar-item-button {
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        gap: var(--sidebar-button-item-gap, 10px);
        cursor: pointer;
        box-sizing: border-box;
        position: relative;
        background: none;
        border-radius: 0;
      }

      .sidebarMenu.sidebarMenu--buttons
        li.sidebar-item-button:not(.sidebar-item-button--with-label) {
        width: var(--sidebar-button-size, 56px);
        height: var(--sidebar-button-size, 56px);
        justify-content: center;
        margin: 0 auto;
      }

      .sidebarMenu.sidebarMenu--buttons
        li.sidebar-item-button.sidebar-item-button--with-label {
        width: 100%;
        height: var(--sidebar-button-size, 56px);
        justify-content: flex-start;
        margin: 0;
      }

      .sidebarMenu.sidebarMenu--buttons li.sidebar-item-button .sidebar-icon-wrapper {
        width: var(--sidebar-button-box-size, 56px);
        height: var(--sidebar-button-box-size, 56px);
        border-radius: var(--sidebar-button-radius, 18px);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(
          --sidebar-button-bg,
          rgba(255, 255, 255, 0.18)
        );
        flex-shrink: 0;
      }

      .sidebarMenu.sidebarMenu--buttons li.sidebar-item-button ha-icon.sidebar-icon {
        color: var(
          --sidebar-button-icon-color,
          var(--sidebar-icon-color, #000)
        );
        width: var(--sidebar-button-icon-size, 28px);
        height: var(--sidebar-button-icon-size, 28px);
        line-height: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sidebarMenu.sidebarMenu--buttons li.sidebar-item-button .sidebar-label {
        font-size: var(--sidebar-button-font-size, 13px);
        line-height: var(--sidebar-button-line-height, 1.2);
        color: var(
          --sidebar-button-text-color,
          var(--primary-text-color, #000)
        );
        font-weight: var(--sidebar-button-font-weight, 500);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebarMenu.sidebarMenu--buttons li.sidebar-item-button.active::before {
        content: none !important;
      }

      .sidebarMenu.sidebarMenu--buttons
        li.sidebar-item-button.active .sidebar-icon-wrapper {
        border: var(--sidebar-button-active-border-width, 3px) solid
          var(--sidebar-button-active-border-color, #ffffff);
        box-sizing: border-box;
        box-shadow: 0 0 8px
          var(
            --sidebar-button-active-shadow-color,
            rgba(0, 0, 0, 0.18)
          );
      }

      .sidebarMenu.sidebarMenu--buttons
        li.sidebar-item-button.active ha-icon.sidebar-icon {
        color: var(
          --sidebar-button-active-icon-color,
          var(--sidebar-selected-icon-color, rgb(247, 217, 89))
        );
      }

      .sidebarMenu.sidebarMenu--buttons
        li.sidebar-item-button.active .sidebar-label {
        color: var(
          --sidebar-button-active-text-color,
          var(
            --sidebar-button-text-color,
            var(--primary-text-color, #000)
          )
        );
      }

      /* === STILE MENU "GRID" === */

      .sidebarMenu.sidebarMenu--grid {
        border: none;
        margin: var(--sidebar-grid-margin-y, 14px) 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(
          var(--sidebar-grid-columns, 3),
          minmax(0, 1fr)
        );
        grid-auto-rows: var(--sidebar-grid-row-height, 96px);
        gap: var(--sidebar-grid-gap, 12px);
        max-height: calc(
          var(--sidebar-grid-row-height, 96px) *
            var(--sidebar-grid-rows, 2)
        );
        overflow-y: auto;
      }

      .sidebarMenu.sidebarMenu--grid li.sidebar-item-grid {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        background: none;
        padding: var(--sidebar-grid-item-padding, 4px) 0 0;
        position: relative;
      }

      .sidebarMenu.sidebarMenu--grid li.sidebar-item-grid .sidebar-icon-wrapper {
        width: var(--sidebar-grid-box-size, 72px);
        height: var(--sidebar-grid-box-size, 72px);
        border-radius: var(--sidebar-grid-radius, 22px);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(
          --sidebar-grid-bg,
          var(--sidebar-button-bg, rgba(255, 255, 255, 0.15))
        );
        flex-shrink: 0;
      }

      .sidebarMenu.sidebarMenu--grid li.sidebar-item-grid ha-icon.sidebar-icon {
        --mdc-icon-size: var(--sidebar-grid-icon-size, 40px);
        width: var(--sidebar-grid-icon-size, 40px);
        height: var(--sidebar-grid-icon-size, 40px);
        line-height: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(
          --sidebar-grid-icon-color,
          var(--sidebar-icon-color, #000)
        );
      }

      .sidebarMenu.sidebarMenu--grid li.sidebar-item-grid .sidebar-label {
        margin-top: var(--sidebar-grid-label-margin-top, 6px);
        font-size: var(--sidebar-grid-font-size, 11px);
        line-height: var(--sidebar-grid-line-height, 1.2);
        text-align: center;
        color: var(
          --sidebar-grid-text-color,
          var(--primary-text-color, #000)
        );
        font-weight: var(--sidebar-grid-font-weight, 500);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebarMenu.sidebarMenu--grid li.sidebar-item-grid.active::before {
        content: none !important;
      }

      .sidebarMenu.sidebarMenu--grid
        li.sidebar-item-grid.active .sidebar-icon-wrapper {
        box-shadow: 0 0 0 2px
          var(--sidebar-grid-active-border, rgba(255, 255, 255, 0.7));
        background-color: var(
          --sidebar-grid-active-bg,
          var(--sidebar-grid-bg, rgba(255, 255, 255, 0.25))
        );
      }

      .sidebarMenu.sidebarMenu--grid
        li.sidebar-item-grid.active ha-icon.sidebar-icon {
        color: var(
          --sidebar-grid-active-icon-color,
          var(--sidebar-selected-icon-color, rgb(247, 217, 89))
        );
      }

      .sidebarMenu.sidebarMenu--grid
        li.sidebar-item-grid.active .sidebar-label {
        color: var(
          --sidebar-grid-active-text-color,
          var(--sidebar-grid-text-color, var(--primary-text-color, #000))
        );
      }
    `;
  }
}

customElements.define('sidebar-card', SidebarCard);

// ##########################################################################################
// ###   Helper methods
// ##########################################################################################

function getLovelace() {
  let root: any = document.querySelector('home-assistant');
  root = root && root.shadowRoot;
  root = root && root.querySelector('home-assistant-main');
  root = root && root.shadowRoot;
  root = root && root.querySelector('ha-drawer partial-panel-resolver');
  root = (root && root.shadowRoot) || root;
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
      console.info(
        `%c${SIDEBAR_CARD_TITLE}: %c ${method.padEnd(24)} -> %c ${message}`,
        'color: chartreuse; background: black; font-weight: 700;',
        'color: yellow; background: black; font-weight: 700;',
        '',
        object,
      );
    }
  }
}

async function error2console(method: string, message: string, object?: any) {
  const lovelace = await getConfig();
  if (lovelace.config.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if (sidebarConfig.debug === true) {
      console.error(
        `%c${SIDEBAR_CARD_TITLE}: %c ${method.padEnd(24)} -> %c ${message}`,
        'color: red; background: black; font-weight: 700;',
        'color: white; background: black; font-weight: 700;',
        'color:red',
        object,
      );
    }
  }
}

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

function getHeaderHeightPx() {
  let headerHeightPx = '0px';
  const root = getRoot();
  if (!root || !root.shadowRoot) {
    return headerHeightPx;
  }
  const view = root.shadowRoot.getElementById('view') as HTMLElement | null;
  if (view && window.getComputedStyle(view) !== undefined) {
    headerHeightPx = window.getComputedStyle(view).paddingTop;
  }
  return headerHeightPx;
}

function getSidebar() {
  let sidebar: any = document.querySelector('home-assistant');
  sidebar = sidebar && sidebar.shadowRoot;
  sidebar = sidebar && sidebar.querySelector('home-assistant-main');
  sidebar = sidebar && sidebar.shadowRoot;
  sidebar = sidebar && sidebar.querySelector('ha-drawer ha-sidebar');

  return sidebar;
}

function getAppDrawerLayout() {
  let appDrawerLayout: any = document.querySelector('home-assistant');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('home-assistant-main');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('ha-drawer');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout =
    appDrawerLayout && appDrawerLayout.querySelector('.mdc-drawer-app-content');

  return appDrawerLayout;
}

function getAppDrawer() {
  let appDrawer: any = document.querySelector('home-assistant');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('home-assistant-main');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('ha-drawer');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('.mdc-drawer');

  return appDrawer;
}

function getParameterByName(name: string, url = window.location.href) {
  const parameterName = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + parameterName + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function updateStyling(
  appLayout: any,
  sidebarConfig: any,
) {
  if (!appLayout) return;

  const styleEl = appLayout.querySelector('#customSidebarStyle');
  if (!styleEl) {
    return;
  }

  const width = document.body.clientWidth;
  styleEl.textContent = createCSS(sidebarConfig, width);

  const root = getRoot();
  if (!root || !root.shadowRoot) {
    log2console(
      'updateStyling',
      'Root hui-root o shadowRoot non pronto, skip styling header/footer',
    );
    return;
  }

  const hassHeader = root.shadowRoot.querySelector('.header') as HTMLElement | null;
  const hassFooter = (root.shadowRoot.querySelector('ch-footer') ||
    root.shadowRoot.querySelector('app-footer')) as HTMLElement | null;
  const offParam = getParameterByName('sidebarOff');
  const view = root.shadowRoot.getElementById('view') as HTMLElement | null;
  const headerHeightPx = getHeaderHeightPx();
  const widthPx = document.body.clientWidth;

  if (
    sidebarConfig.hideTopMenu &&
    sidebarConfig.hideTopMenu === true &&
    sidebarConfig.showTopMenuOnMobile &&
    sidebarConfig.showTopMenuOnMobile === true &&
    widthPx <= sidebarConfig.breakpoints.mobile &&
    offParam == null
  ) {
    if (hassHeader) {
      hassHeader.style.display = 'block';
    }
    if (view) {
      view.style.minHeight = 'calc(100vh - ' + headerHeightPx + ')';
    }
    if (hassFooter) {
      hassFooter.style.display = 'flex';
    }
  } else if (sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && offParam == null) {
    if (hassHeader) {
      hassHeader.style.display = 'none';
    }
    if (hassFooter) {
      hassFooter.style.display = 'none';
    }
    if (view) {
      view.style.minHeight = 'calc(100vh)';
    }
  }
}

function subscribeEvents(
  appLayout: any,
  sidebarConfig: any,
  contentContainer: any,
  sidebar: any,
) {
  window.addEventListener(
    'resize',
    () => {
      updateStyling(appLayout, sidebarConfig);
    },
    true,
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
      if (!root || !root.shadowRoot) {
        return;
      }

      const appLayout = root.shadowRoot.querySelector('div');
      if (!appLayout) {
        return;
      }

      const customSidebarWrapper = appLayout.querySelector(
        '#customSidebarWrapper',
      ) as HTMLElement | null;
      if (!customSidebarWrapper) {
        buildSidebar();
      } else {
        const customSidebar = customSidebarWrapper.querySelector(
          '#customSidebar',
        ) as HTMLElement | null;
        if (!customSidebar) {
          buildSidebar();
        }
      }
    });
  }, 1000);
}

async function buildCard(sidebar: any, config: any) {
  const sidebarCard = document.createElement('sidebar-card') as SidebarCard;
  sidebarCard.setConfig(config);
  sidebarCard.hass = hass();

  sidebar.appendChild(sidebarCard);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function createCSS(sidebarConfig: any, width: number) {
  let sidebarWidth = 25;
  let contentWidth = 75;
  let sidebarResponsive = false;
  const headerHeightPx = getHeaderHeightPx();

  if (sidebarConfig.width) {
    if (typeof sidebarConfig.width === 'number') {
      sidebarWidth = sidebarConfig.width;
      contentWidth = 100 - sidebarWidth;
    } else if (typeof sidebarConfig.width === 'object') {
      sidebarWidth = sidebarConfig.desktop;
      contentWidth = 100 - sidebarWidth;
      sidebarResponsive = true;
    }
  }

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
      if (sidebarConfig.width.mobile === 0) {
        css += `
          #customSidebar {
            width:${sidebarConfig.width.mobile}%;
            overflow:hidden;
            display:none;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
          headerHeightPx +
          ' + env(safe-area-inset-top));'}
          } 
          #view {
            width:${100 - sidebarConfig.width.mobile}%;
            ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      } else {
        css += `
          #customSidebar {
            width:${sidebarConfig.width.mobile}%;
            overflow:hidden;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
          headerHeightPx +
          ' + env(safe-area-inset-top));'}
          } 
          #view {
            width:${100 - sidebarConfig.width.mobile}%;
            ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      }
    } else if (width <= sidebarConfig.breakpoints.tablet) {
      if (sidebarConfig.width.tablet === 0) {
        css += `
          #customSidebar {
            width:${sidebarConfig.width.tablet}%;
            overflow:hidden;
            display:none;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
          headerHeightPx +
          ' + env(safe-area-inset-top));'}
          } 
          #view {
            width:${100 - sidebarConfig.width.tablet}%;
            ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      } else {
        css += `
          #customSidebar {
            width:${sidebarConfig.width.tablet}%;
            overflow:hidden;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
          headerHeightPx +
          ' + env(safe-area-inset-top));'}
          } 
          #view {
            width:${100 - sidebarConfig.width.tablet}%;
            ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      }
    } else {
      if (sidebarConfig.width.desktop === 0) {
        css += `
          #customSidebar {
            width:${sidebarConfig.width.desktop}%;
            overflow:hidden;
            display:none;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
          headerHeightPx +
          ' + env(safe-area-inset-top));'}
          } 
          #view {
            width:${100 - sidebarConfig.width.desktop}%;
            ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      } else {
        css += `
          #customSidebar {
            width:${sidebarConfig.width.desktop}%;
            overflow:hidden;
            ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
          headerHeightPx +
          ' + env(safe-area-inset-top));'}
          } 
          #view {
            width:${100 - sidebarConfig.width.desktop}%;
            ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
          }
        `;
      }
    }
  } else {
    css += `
      #customSidebar {
        width:${sidebarWidth}%;
        overflow:hidden;
        ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' +
      headerHeightPx +
      ' + env(safe-area-inset-top));'}
      } 
      #view {
        width:${contentWidth}%;
        ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
      }
    `;
  }
  return css;
}

// ##########################################################################################
// ###   The Sidebar + Header code base initialisation
// ##########################################################################################

let SIDEBAR_ALREADY_BUILT = false;

async function buildSidebar() {
  if (SIDEBAR_ALREADY_BUILT) {
    log2console('buildSidebar', 'Sidebar already built, skipping duplicate build');
    return;
  }

  const lovelace = await getConfig();
  const sidebarConfig = lovelace.config.sidebar || null;

  if (!sidebarConfig) {
    log2console('buildSidebar', 'No sidebar config found');
    return;
  }
  

  const root = getRoot();
  if (!root || !root.shadowRoot) {
    error2console('buildSidebar', 'Root element or shadowRoot not found!');
    return;
  }

  const hassSidebar = getSidebar();
  const appDrawerLayout = getAppDrawerLayout();
  const appDrawer = getAppDrawer();
  const offParam = getParameterByName('sidebarOff');
  const appLayout = root.shadowRoot.querySelector('div') as HTMLElement | null;

  if (!appLayout) {
    error2console('buildSidebar', 'App layout not found');
    return;
  }

    // ----- SIDEBAR -----
    if (
      sidebarConfig &&
      (!sidebarConfig.width ||
        (typeof sidebarConfig.width === 'number' &&
          sidebarConfig.width > 0 &&
          sidebarConfig.width < 100) ||
        typeof sidebarConfig.width === 'object')
    ) {
      if (appLayout.querySelector('#customSidebarWrapper')) {
        log2console('buildSidebar', 'customSidebarWrapper already present, skipping build');
      } else {
        if (sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && offParam == null) {
          if (root.shadowRoot.querySelector('ch-header'))
            (root.shadowRoot.querySelector('ch-header') as HTMLElement).style.display = 'none';
          if (root.shadowRoot.querySelector('app-header'))
            (root.shadowRoot.querySelector('app-header') as HTMLElement).style.display = 'none';
          if (root.shadowRoot.querySelector('ch-footer'))
            (root.shadowRoot.querySelector('ch-footer') as HTMLElement).style.display = 'none';
          if (root.shadowRoot.getElementById('view'))
            (root.shadowRoot.getElementById('view') as HTMLElement).style.minHeight = 'calc(100vh)';
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
          sidebarConfig.breakpoints = { tablet: 1024, mobile: 768 };
        } else {
          if (!sidebarConfig.breakpoints.mobile) sidebarConfig.breakpoints.mobile = 768;
          if (!sidebarConfig.breakpoints.tablet) sidebarConfig.breakpoints.tablet = 1024;
        }

        const css = createCSS(sidebarConfig, document.body.clientWidth);
        const style: any = document.createElement('style');
        style.setAttribute('id', 'customSidebarStyle');
        appLayout.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) {
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        const contentContainer = appLayout.querySelector('#view') as HTMLElement | null;
        if (!contentContainer || !contentContainer.parentNode) {
          error2console('buildSidebar', 'View element not found');
        } else {
          let wrapper = appLayout.querySelector('#customSidebarWrapper') as HTMLElement | null;
          if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.setAttribute('id', 'customSidebarWrapper');
            contentContainer.parentNode.insertBefore(wrapper, contentContainer);
            wrapper.appendChild(contentContainer);
          }

          let sidebar = wrapper.querySelector('#customSidebar') as HTMLElement | null;
          if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.setAttribute('id', 'customSidebar');
            wrapper.insertBefore(sidebar, wrapper.firstChild);
          }

          await buildCard(sidebar, sidebarConfig);
          subscribeEvents(appLayout, sidebarConfig, contentContainer, sidebar);

          setTimeout(() => {
            updateStyling(appLayout, sidebarConfig);
          }, 1);
        }
      }
    } else if (sidebarConfig) {
      error2console('buildSidebar', 'Error in sidebar width config!');
    }
  }
  

// show console message on init
console.info(
  `%c  ${SIDEBAR_CARD_TITLE.padEnd(24)}%c
  Version: ${SIDEBAR_CARD_VERSION.padEnd(9)}      `,
  'color: chartreuse; background: black; font-weight: 700;',
  'color: white; background: dimgrey; font-weight: 700;',
);

buildSidebar();
watchLocationChange();
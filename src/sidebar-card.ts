// ------------------------------------------------------------------------------------------
//  SIDEBAR-CARD
// ------------------------------------------------------------------------------------------
//  https://github.com/DBuit/sidebar-card
// ------------------------------------------------------------------------------------------

// ##########################################################################################
// ###   Global constants
// ##########################################################################################

const SIDEBAR_CARD_TITLE = 'SIDEBAR-CARD';
const SIDEBAR_CARD_VERSION = '0.1.9.8.0';

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
  bottomCard: any = null;
  CUSTOM_TYPE_PREFIX = 'custom:';

  // Markus:
  // Stores the setInterval handle for the periodic clock update
  // Stores the setInterval handle for the periodic date update
  // Stores the bound event handler function for the 'location-changed' event, used to update the active menu item with the correct `this` context
  _clockInterval: any = null;
  _dateInterval: any = null;
  _boundLocationChange: any;

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

  //Markus:
  // Binds the location change handler to update the active menu item with a short delay
  constructor() {
    super();
    this._boundLocationChange = () => {
        setTimeout(() => this._updateActiveMenu(), 50);
    };
  }  
  
  connectedCallback() {
    super.connectedCallback();
    // Starts the observer for URL changes
    window.addEventListener('location-changed', this._boundLocationChange);
    
    // --- FIX START ---
    // Start timers if they are configured and not already running.
    // This ensures they restart every time the card is re-connected to the DOM.
    if ((this.config.clock || this.config.digitalClock) && !this._clockInterval) {
      const self = this;
      const inc = 1000;
      self._runClock(); // Run once immediately
      this._clockInterval = setInterval(function() {
        self._runClock();
      }, inc);
    }
    if (this.config.date && !this._dateInterval) {
      const self = this;
      const inc = 1000 * 60 * 60;
      self._runDate(); // Run once immediately
      this._dateInterval = setInterval(function() {
        self._runDate();
      }, inc);
    }
    // --- FIX END ---

    this._updateActiveMenu();
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
    this.bottomCard = this.config.bottomCard ? this.config.bottomCard : null;
    this.updateMenu = this.config.hasOwnProperty('updateMenu') ? this.config.updateMenu : true;

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

  firstUpdated() {
    provideHass(this);
    let root = getRoot();

    // The clock and date interval logic is now moved to connectedCallback()
    // to handle reloads correctly. This section can be removed.
    /*
    const self = this;
    if (this.clock || this.digitalClock) {
      const inc = 1000;
      self._runClock();
      this._clockInterval = setInterval(function() {
        self._runClock();
      }, inc);
    }
    if (this.date) {
      const inc = 1000 * 60 * 60;
      self._runDate();
      this._dateInterval = setInterval(function() {
        self._runDate();
      }, inc);
    }
    */
   
    const self = this; // self is needed for the setTimeouts below
    
    setTimeout(() => {
      self.updateSidebarSize(root);
      self._updateActiveMenu();
    }, 50); 

    setTimeout(() => {
      self.updateSidebarSize(root);
    }, 350);

    window.addEventListener(
      'resize',
      function() {
        setTimeout(() => {
          self.updateSidebarSize(root);
        }, 1);
      },
      true
    );

    if (this.bottomCard) {
      setTimeout(() => {
        var card = {
          type: this.bottomCard.type,
        };
        card = Object.assign({}, card, this.bottomCard.cardOptions);
        log2console('firstUpdated', 'Bottom card: ', card);
        if (!card || typeof card !== 'object' || !card.type) {
          error2console('firstUpdated', 'Bottom card config error!');
        } else {
          let tag = card.type;
          if (tag.startsWith(this.CUSTOM_TYPE_PREFIX)) tag = tag.substr(this.CUSTOM_TYPE_PREFIX.length);
          else tag = `hui-${tag}-card`;

          const cardElement = document.createElement(tag);
          cardElement.setConfig(card);
          cardElement.hass = hass();

          var bottomSection = this.shadowRoot.querySelector('.bottom');
          bottomSection.appendChild(cardElement);
          provideHass(cardElement);

          if (this.bottomCard.cardStyle && this.bottomCard.cardStyle != '') {
            let style = this.bottomCard.cardStyle;
            let itterations = 0;
            let interval = setInterval(function() {
              if (cardElement && cardElement.shadowRoot) {
                window.clearInterval(interval);
                var styleElement = document.createElement('style');
                styleElement.innerHTML = style;
                cardElement.shadowRoot.appendChild(styleElement);
              } else if (++itterations === 10) {
                window.clearInterval(interval);
              }
            }, 100);
          }
        }
      }, 2);
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
      // Markus:
      // This line is commented out because the menu update is now triggered by the 'location-changed' event
      //this._updateActiveMenu();
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
        padding: 20px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: fixed;
        width: 0;
        overflow: hidden auto;
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
      if (sidebarConfig.width.tablet == 0) {
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

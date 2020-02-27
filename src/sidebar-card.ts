import { LitElement, html, css } from 'lit-element';
import { moreInfo } from "card-tools/src/more-info";
import { createCard } from "card-tools/src/lovelace-element";
import { hass } from "card-tools/src/hass";
import {subscribeRenderTemplate} from "card-tools/src/templates";
import {
  toggleEntity,
  navigate,
  forwardHaptic,
  getLovelace,
  getRoot
} from 'custom-card-helpers';

class SidebarCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;
  renderCard: any;
  templateLines: any = [];
  clock = false;
  digitalClock = false;
  digitalClockWithSeconds = false;

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {}
    };
  }
  
  constructor() {
    super();
  }
  
  render() {
    const sidebarMenu = this.config.sidebarMenu;
    const title = "title" in this.config ? this.config.title : false;
    this.clock = this.config.clock ? this.config.clock : false;
    this.digitalClock = this.config.digitalClock ? this.config.digitalClock : false;
    this.digitalClockWithSeconds = this.config.digitalClockWithSeconds ? this.config.digitalClockWithSeconds : false;

    // Breakpoints
    if(!this.config.breakpoints) {
      this.config.breakpoints = {
        'tablet': 1024,
        'mobile': 768
      }
    } else if(this.config.breakpoints) {
      if(!this.config.breakpoints.mobile) {
        this.config.breakpoints.mobile = 768;
      }
      if(!this.config.breakpoints.tablet) {
        this.config.breakpoints.tablet = 1024;
      }
    }
    
    return html`
      ${this.config.style ? html`
        <style>
          ${this.config.style}
        </style>
      `:html``}
      <style>
        ${this._createCSS()}
      </style>
      
      <div id="wrapper">

        <div id="sidebar">
          <div class="sidebar-inner">
            ${this.digitalClock ? html`<h1 class="digitalClock${title ? ' with-title':''}${this.digitalClockWithSeconds ? ' with-seconds' : ''}"></h1>`: html``}
            ${this.clock ? html`
              <div class="clock">
                <div class="wrap">
                  <span class="hour"></span>
                  <span class="minute"></span>
                  <span class="second"></span>
                  <span class="dot"></span>
                </div>
              </div>
            ` : html``}
            ${title ? html`<h1>${title}</h1>`: html``}
            
            ${sidebarMenu.length > 0 ? html`
            <ul class="sidebarMenu">
              ${sidebarMenu.map(sidebarMenuItem => {
                return html`<li @click="${e => this._menuAction(e)}" class="${sidebarMenuItem.state && this.hass.states[sidebarMenuItem.state].state != 'off' && this.hass.states[sidebarMenuItem.state].state != 'unavailable' ? 'active' : ''}" data-type="${sidebarMenuItem.action}" data-path="${sidebarMenuItem.navigation_path ? sidebarMenuItem.navigation_path : ''}" data-menuitem="${JSON.stringify(sidebarMenuItem)}">
                  ${sidebarMenuItem.name}
                  ${sidebarMenuItem.icon ? html`<ha-icon icon="${sidebarMenuItem.icon}" />`:html``}
                </li>`;
              })}
            </ul>
            ` : html``}

            ${this.config.template ? html`
              <ul class="template">
                ${this.templateLines.map(line => {
                  return html`<li>${line}</li>`;
                })}
              </ul>
            ` : html``}
            
          </div>
        </div>
        <div id="cards">
        </div>

      </div>
    `;
  }

  async build_card(card) {
    const el = createCard(card);
    el.hass = hass();
    this.shadowRoot.querySelector("#cards").appendChild(el);
    return new Promise((resolve) =>
      el.updateComplete
        ? el.updateComplete.then(() => resolve(el))
        : resolve(el)
      );
  }

  async build_cards() {
    // Clear out any cards in the staging area which might have been built but not placed
    const cards = this.shadowRoot.querySelector("#cards");
    while(cards.lastChild)
    cards.removeChild(cards.lastChild);
    return Promise.all(this.config.cards.map((c) => this.build_card(c)));
  }

  _runClock() {
    const date = new Date();
  
    const fullhours = date.getHours().toString();
    const hours = ((date.getHours() + 11) % 12 + 1);
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const hour = hours * 30;
    const minute = minutes * 6;
    const second = seconds * 6;
    
    if(this.clock) {
      this.shadowRoot.querySelector('.hour').style.transform = `rotate(${hour}deg)`
      this.shadowRoot.querySelector('.minute').style.transform = `rotate(${minute}deg)`
      this.shadowRoot.querySelector('.second').style.transform = `rotate(${second}deg)`
    }
    if(this.digitalClock) {
      const minutesString = minutes.toString();
      var digitalTime = fullhours.length < 2 ? '0' + fullhours + ':' : fullhours + ':';
      if(this.digitalClockWithSeconds) { 
        digitalTime += minutesString.length < 2 ? '0' + minutesString + ':' : minutesString + ':';
        const secondsString = seconds.toString();
        digitalTime += secondsString.length < 2 ? '0' + secondsString : secondsString
      } else {
        digitalTime += minutesString.length < 2 ? '0' + minutesString : minutesString;
      }
      this.shadowRoot.querySelector('.digitalClock').textContent = digitalTime;
    }
  }

  _createCSS() {
    // Width
    let sidebarWidth = 25;
    let contentWidth = 75;
    let sidebarResponsive = false;
    if(this.config.width) {
      if(typeof this.config.width == 'number') {
        sidebarWidth = this.config.width;
        contentWidth = 100 - sidebarWidth;
      } else if(typeof this.config.width == 'object') {
        sidebarWidth = this.config.desktop;
        contentWidth = 100 - sidebarWidth;
        sidebarResponsive = true;
      }
    }

    if(sidebarResponsive) {
      return html`
          :host {
            --sidebar-width:${this.config.width.desktop}%;
            --content-width:${(100 - this.config.width.desktop)}%;
          }
          @media (max-width: ${this.config.breakpoints.tablet}px) {
            :host {
              --sidebar-width:${this.config.width.tablet}%;
              --content-width:${(100 - this.config.width.tablet)}%;
            }
          }
          @media (max-width: ${this.config.breakpoints.mobile}px) {
            :host {
              --sidebar-width:${this.config.width.mobile}%;
              --content-width:${(100 - this.config.width.mobile)}%;
            }
          }
        `;
    } else {
      return html`
        :host {
          --sidebar-width:${sidebarWidth}%;
          --content-width:${contentWidth}%;
        }
      `;
    }
  }
  

  firstUpdated() {
    this._updateActiveMenu();
    this._subscribeEvens(this.config);
    if(this.clock || this.digitalClock) {
      const inc = 1000;
      const self = this;
      self._runClock();
      setInterval(function () {
        self._runClock();
      }, inc);
    }
  }
  
  async updated() {
    await this.build_cards();
  }

  _subscribeEvens(config) {
    let root: any = getRoot();
    window.addEventListener('resize', function() {
      const width = document.body.clientWidth;
      if(config.hideTopMenu && config.hideTopMenu === true && config.showTopMenuOnMobile && config.showTopMenuOnMobile === true && width <= config.breakpoints.mobile) {
        root.querySelector('ch-header').style.display = 'flex';
      } else if(config.hideTopMenu && config.hideTopMenu === true) {
        root.querySelector('ch-header').style.display = 'none';
      }
    }, true);
  }
  

  _updateActiveMenu() {
    this.shadowRoot.querySelectorAll('ul.sidebarMenu li[data-type="navigate"]').forEach(menuItem => {
      menuItem.classList.remove("active");
    });
    this.shadowRoot.querySelector('ul.sidebarMenu li[data-path="'+document.location.pathname+'"]').classList.add('active');
  }

  _menuAction(e) {
    if(e.target.dataset && e.target.dataset.menuitem) {
      const menuItem = JSON.parse(e.target.dataset.menuitem);
      this._customAction(menuItem);
    }
  }

  _customAction(tapAction) {
    switch (tapAction.action) {
      case "more-info":
        if (tapAction.entity || tapAction.camera_image) {
          moreInfo(tapAction.entity ? tapAction.entity : tapAction.camera_image!);
        }
        break;
      case "navigate":
        if (tapAction.navigation_path) {
          navigate(window, tapAction.navigation_path);
        }
        break;
      case "url":
        if (tapAction.url_path) {
          window.open(tapAction.url_path);
        }
        break;
      case "toggle":
        if (tapAction.entity) {
          toggleEntity(this.hass, tapAction.entity!);
          forwardHaptic("success");
        }
        break;
      case "call-service": {
        if (!tapAction.service) {
          forwardHaptic("failure");
          return;
        }
        const [domain, service] = tapAction.service.split(".", 2);
        this.hass.callService(domain, service, tapAction.service_data);
        forwardHaptic("success");
      }
    }
  }
  
  setConfig(config) {
    if (!config.cards) {
      throw new Error("You need to define cards");
    }
    this.config = Object.assign({}, config);

    let lovelace = getLovelace();
    if(lovelace.config.sidebar) {
      this.config = {...this.config, ...lovelace.config.sidebar }
    }

    if(this.config.template) {
      subscribeRenderTemplate(null, (res) => {
        var result = res.match(/<li>(.*?)<\/li>/gs).map(function(val){
          return val.replace(/<\/?li>/g,'');
        });
        this.templateLines = result;
        this.requestUpdate();
      }, {
        template: this.config.template,
        variables: {config: this.config},
        entity_ids: this.config.entity_ids,
      });
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
          // --sidebar-background: transparent;
          // --sidebar-text-color: #000;
        }
        #wrapper {
          display:flex;
          flex-direction:row;
          height:100%;
        }

        #wrapper #sidebar {
          overflow: hidden;
          width: var(--sidebar-width, 25%);
          background-color: var(--sidebar-background, transparent);
        }

        #wrapper #cards {
          width: var(--content-width, 75%);
        }
        .sidebar-inner {
          padding: 20px;
        }
        .sidebarMenu {
          list-style:none;
          margin: 20px 0;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          color: var(--sidebar-text-color, #000);
        }
        .sidebarMenu li {
          padding: 10px 20px;
          border-radius: 12px;
          color:inherit;
          font-size:18px;
          line-height: 24px;
          font-weight:300;
          white-space: normal;
          display:block;
          cursor:pointer;
        }
        .sidebarMenu li ha-icon {
          float:right;
        }
        .sidebarMenu li.active ha-icon {
          color: rgb(247, 217, 89);
        }
        .sidebarMenu li.active {
          background-color: rgba(0,0,0,0.2);
        }

        h1 {
          margin-top:0;
          margin-bottom: 20px;
          font-size: 32px;
          line-height: 32px;
          font-weight: 200;
          color: var(--sidebar-text-color, #000);
        }
        h1.digitalClock {
          font-size:60px;
          line-height: 60px;
        }
        h1.digitalClock.with-seconds {
          font-size: 48px;
          line-height:48px;
        }
        h1.digitalClock.with-title {
          margin-bottom:0;
        }
        .template {
          margin: 0;
          padding: 0;
          list-style:none;
          color: var(--sidebar-text-color, #000);
        }
        
        .template li {
          display:block;
          color:inherit;
          font-size:18px;
          line-height: 24px;
          font-weight:300;
          white-space: normal;
        }

        .clock {
          margin:20px 0;
          position:relative;
          padding-top: calc(100% - 10px);
          width: calc(100% - 10px);
          border-radius: 100%;
          background: var(--face-color, #FFF);
          font-family: "Montserrat";
          border: 5px solid var(--face-border-color, #FFF);
          box-shadow: inset 2px 3px 8px 0 rgba(0, 0, 0, 0.1);
        }
        
        .clock .wrap {
          overflow: hidden;
          position: absolute;
          top:0;
          left:0;
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
          background: var(--clock-seconds-hand-color, #FF4B3E);
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
          background: var(--clock-middle-background, #FFF);
          border: 2px solid var(--clock-middle-border, #000);
          border-radius: 100px;
          margin: auto;
          z-index: 1;
        }
    `;
  }  
  
}

customElements.define('sidebar-card', SidebarCard);

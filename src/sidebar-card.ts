import { LitElement, html, css } from 'lit-element';
import { moreInfo } from "card-tools/src/more-info";
// import { createCard } from "card-tools/src/lovelace-element";
import { hass, provideHass } from "card-tools/src/hass";
import {subscribeRenderTemplate} from "card-tools/src/templates";
import moment from 'moment/min/moment-with-locales';
import {
  toggleEntity,
  navigate,
  forwardHaptic,
  getLovelace
} from 'custom-card-helpers';

class SidebarCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;
  renderCard: any;
  templateLines: any = [];
  clock = false;
  digitalClock = false;
  twelveHourVersion = false;
  digitalClockWithSeconds = false;
  period = false;
  date = false;
  dateFormat = "DD MMMM";
  bottomCard: any = null;
  CUSTOM_TYPE_PREFIX = "custom:";

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
    this.twelveHourVersion = this.config.twelveHourVersion ? this.config.twelveHourVersion : false;
    this.period = this.config.period ? this.config.period : false;
    this.date = this.config.date ? this.config.date : false;
    this.dateFormat = this.config.dateFormat ? this.config.dateFormat : "DD MMMM";
    this.bottomCard = this.config.bottomCard ? this.config.bottomCard : null;
    const addStyle = "style" in this.config ? true : false;
    return html`
      ${addStyle ? html`
        <style>
          ${this.config.style}
        </style>
      ` : html``}
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
        ${this.date ? html`
          <h2 class="date"></h2>
        ` : html`` }
        
        ${sidebarMenu && sidebarMenu.length > 0 ? html`
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

        ${this.bottomCard ? html`
          <div class="bottom">
          </div>
        ` : html`` }
        
      </div>
    `;
  }

  _runClock() {
    const date = new Date();
  
    var fullhours = date.getHours().toString();
    const realHours = date.getHours();
    const hours = ((realHours + 11) % 12 + 1);
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const hour = Math.floor((hours * 60 + minutes) / 2);
    const minute = minutes * 6;
    const second = seconds * 6;
    
    if(this.clock) {
      this.shadowRoot.querySelector('.hour').style.transform = `rotate(${hour}deg)`
      this.shadowRoot.querySelector('.minute').style.transform = `rotate(${minute}deg)`
      this.shadowRoot.querySelector('.second').style.transform = `rotate(${second}deg)`
    }
    if(this.digitalClock && !this.twelveHourVersion) {
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
    } else if(this.digitalClock && this.twelveHourVersion && !this.period) {
      var hoursampm = date.getHours();
      hoursampm = hoursampm % 12;
      hoursampm = hoursampm ? hoursampm : 12; 
      fullhours = hoursampm.toString();
      const minutesString = minutes.toString();
      var digitalTime = fullhours.length < 2 ? '0' + fullhours + ':' : fullhours + ':';
      if(this.digitalClockWithSeconds) { 
        digitalTime += minutesString.length < 2 ? '0' + minutesString + ':' : minutesString + ':';
        const secondsString = seconds.toString();
        digitalTime += secondsString.length < 2 ? '0' + secondsString : secondsString
      } else {
        digitalTime += minutesString.length < 2 ? '0' + minutesString : minutesString;
      }
      digitalTime;
      this.shadowRoot.querySelector('.digitalClock').textContent = digitalTime;
    } else if(this.digitalClock && this.twelveHourVersion && this.period) {
      var ampm = realHours >= 12 ? 'pm' : 'am';
      var hoursampm = date.getHours();
      hoursampm = hoursampm % 12;
      hoursampm = hoursampm ? hoursampm : 12; 
      fullhours = hoursampm.toString();
      const minutesString = minutes.toString();
      var digitalTime = fullhours.length < 2 ? '0' + fullhours + ':' : fullhours + ':';
      if(this.digitalClockWithSeconds) { 
        digitalTime += minutesString.length < 2 ? '0' + minutesString + ':' : minutesString + ':';
        const secondsString = seconds.toString();
        digitalTime += secondsString.length < 2 ? '0' + secondsString : secondsString
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
    const date = now.format(this.dateFormat);
    this.shadowRoot.querySelector('.date').textContent = date;
  }

  updateSidebarSize(root) {
    const sidebarInner = this.shadowRoot.querySelector('.sidebar-inner');
    const header = root.shadowRoot.querySelector('ch-header');
    const _1vh = window.innerHeight / 100;
    if(sidebarInner) {
      sidebarInner.style.width = this.offsetWidth + 'px';
      let headerHeight = 50;
      if(header) {
        if(header.offsetParent === null) {
          headerHeight = 0;
        } else {
          headerHeight = header.offsetHeight;
        }
      }
      console.log('headerHeight', headerHeight);
      sidebarInner.style.height = (100 * _1vh) - headerHeight + 'px';
    }
  }

  firstUpdated() {
    provideHass(this);
    let root = getRoot();
    root.shadowRoot.querySelectorAll("paper-tab").forEach(paperTab => {
      console.log('Menu item found');
      paperTab.addEventListener('click', () => {
        this._updateActiveMenu();
      })
    });
    const self = this;
    if(this.clock || this.digitalClock) {
      const inc = 1000;
      self._runClock();
      setInterval(function () {
        self._runClock();
      }, inc);
    }
    if(this.date) {
      const inc = 1000 * 60 * 60;
      self._runDate();
      setInterval(function () {
        self._runDate();
      }, inc);
    }

    setTimeout(() => {
      self.updateSidebarSize(root);
      self._updateActiveMenu();
    }, 1000);
    window.addEventListener('resize', function() {
      self.updateSidebarSize(root);
    }, true);

    setTimeout(() => {
      var card = {
        type: this.bottomCard.type
      };
      card = Object.assign({}, card, this.bottomCard.cardOptions);
      console.log(card);
      if(!card || typeof card !== "object" || !card.type) {
        console.log('Bottom card config error!')
      } else {
        let tag = card.type;
        if(tag.startsWith(this.CUSTOM_TYPE_PREFIX))
          tag = tag.substr(this.CUSTOM_TYPE_PREFIX.length);
        else
          tag = `hui-${tag}-card`;

        const cardElement = document.createElement(tag);
        cardElement.setConfig(card);
        cardElement.hass = hass();

        var bottomSection = this.shadowRoot.querySelector('.bottom');
        bottomSection.appendChild(cardElement);
        provideHass(cardElement);

        if(this.bottomCard.cardStyle && this.bottomCard.cardStyle != "") {
          let style = this.bottomCard.cardStyle;
          let itterations = 0;
          let interval = setInterval(function() {
            if(cardElement && cardElement.shadowRoot) {
              window.clearInterval(interval);
              var styleElement = document.createElement('style');
              styleElement.innerHTML = style;
              cardElement.shadowRoot.appendChild(styleElement);
            } else if(++itterations === 10) {
              window.clearInterval(interval);
            }
          }, 100);
        }
      }
    }, 2000);
    
  }

  _updateActiveMenu() {
    this.shadowRoot.querySelectorAll('ul.sidebarMenu li[data-type="navigate"]').forEach(menuItem => {
      menuItem.classList.remove("active");
    });
    let activeEl = this.shadowRoot.querySelector('ul.sidebarMenu li[data-path="'+document.location.pathname+'"]');
    if(activeEl) {
      activeEl.classList.add('active');
    }
  }

  _menuAction(e) {
    if(e.target.dataset && e.target.dataset.menuitem) {
      const menuItem = JSON.parse(e.target.dataset.menuitem);
      this._customAction(menuItem);
      this._updateActiveMenu();
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
    this.config = config;

    if(this.config.template) {
      subscribeRenderTemplate(null, (res) => {
        var result = res.match(/<li>([^]*?)<\/li>/g).map(function(val){
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
          // --sidebar-background: #FFF;
          // --sidebar-text-color: #000;
          background-color: var(--sidebar-background, #FFF);
        }
        .sidebar-inner {
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          position:fixed;
          width:0;
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
        h2 {
          margin:0;
          font-size: 26px;
          line-height: 26px;
          font-weight: 200;
          color: var(--sidebar-text-color, #000);
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

        .bottom {
          display:flex;
          margin-top:auto;
        }
    `;
  }  
  
}

customElements.define('sidebar-card', SidebarCard);

function createCSS(sidebarConfig: any, width: number) {
  let sidebarWidth = 25;
  let contentWidth = 75;
  let sidebarResponsive = false;
  if(sidebarConfig.width) {
    if(typeof sidebarConfig.width == 'number') {
      sidebarWidth = sidebarConfig.width;
      contentWidth = 100 - sidebarWidth;
    } else if(typeof sidebarConfig.width == 'object') {
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
    #contentContainer.hideSidebar {
      width:100%!important;
    }
  `;
  if(sidebarResponsive) {
    if(width <= sidebarConfig.breakpoints.mobile) {
      if(sidebarConfig.width.mobile == 0) {
        css += `
          #customSidebar {
            width:`+sidebarConfig.width.mobile+`%;
            overflow:hidden;
            display:none;
          } 
          #contentContainer {
            width:`+(100 - sidebarConfig.width.mobile)+`%;
          }
        `;
      } else {
        css += `
          #customSidebar {
            width:`+sidebarConfig.width.mobile+`%;
            overflow:hidden;
          } 
          #contentContainer {
            width:`+(100 - sidebarConfig.width.mobile)+`%;
          }
        `;
      }
      
    } else if (width <= sidebarConfig.breakpoints.tablet) {
      if(sidebarConfig.width.tablet == 0) {
        css += `
          #customSidebar {
            width:`+sidebarConfig.width.tablet+`%;
            overflow:hidden;
            display:none;
          } 
          #contentContainer {
            width:`+(100 - sidebarConfig.width.tablet)+`%;
          }
        `;
      } else {
        css += `
          #customSidebar {
            width:`+sidebarConfig.width.tablet+`%;
            overflow:hidden;
          } 
          #contentContainer {
            width:`+(100 - sidebarConfig.width.tablet)+`%;
          }
        `;
      }
    } else {
      if(sidebarConfig.width.tablet == 0) {
        css += `
          #customSidebar {
            width:`+sidebarConfig.width.desktop+`%;
            overflow:hidden;
            display:none;
          } 
          #contentContainer {
            width:`+(100 - sidebarConfig.width.desktop)+`%;
          }
        `;
      } else {
        css += `
          #customSidebar {
            width:`+sidebarConfig.width.desktop+`%;
            overflow:hidden;
          } 
          #contentContainer {
            width:`+(100 - sidebarConfig.width.desktop)+`%;
          }
        `;
      }
    }
  } else {
    css += `
      #customSidebar {
        width:`+sidebarWidth+`%;
        overflow:hidden;
      } 
      #contentContainer {
        width:`+contentWidth+`%;
      }
    `;
  }
  return css
}

function getRoot() {
    let root: any = document.querySelector('home-assistant');
    root = root && root.shadowRoot;
    root = root && root.querySelector('home-assistant-main');
    root = root && root.shadowRoot;
    root = root && root.querySelector('app-drawer-layout partial-panel-resolver');
    root = root && root.shadowRoot || root;
    root = root && root.querySelector('ha-panel-lovelace');
    root = root && root.shadowRoot;
    root = root && root.querySelector('hui-root');
    return root;
}

function update(appLayout, sidebarConfig) {
  const width = document.body.clientWidth;
  appLayout.shadowRoot.querySelector('#customSidebarStyle').textContent = createCSS(sidebarConfig, width);

  let root = getRoot();
  const header = root.shadowRoot.querySelector('ch-header');
  if(header) {
    console.log('Header found!');
  } else {
    console.log('Header not found!')
  }
  if(sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && sidebarConfig.showTopMenuOnMobile && sidebarConfig.showTopMenuOnMobile === true && width <= sidebarConfig.breakpoints.mobile) {
    console.log('Action: Show header!');
    if(header) {
      header.style.display = 'flex';
    }
  } else if(sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true) {
    console.log('Action: Hide header!')
    if(header) {
      header.style.display = 'none';
    }
  }
}

function subscribeEvens(appLayout: any, sidebarConfig, contentContainer: any, sidebar: any) {
  window.addEventListener('resize', function() {
    update(appLayout, sidebarConfig);
  }, true);

  if("hideOnPath" in sidebarConfig) {
    window.addEventListener("location-changed", () => {
      if(sidebarConfig.hideOnPath.includes(window.location.pathname)) {
        console.log('Sidebar disable for this path');
        contentContainer.classList.add('hideSidebar');
        sidebar.classList.add('hide');
      } else {
        contentContainer.classList.remove('hideSidebar');
        sidebar.classList.remove('hide');
      }
    });

    if(sidebarConfig.hideOnPath.includes(window.location.pathname)) {
      console.log('Sidebar disable for this path');
      contentContainer.classList.add('hideSidebar');
      sidebar.classList.add('hide');
    }
  }
}

async function buildCard(sidebar, config) {
  const sidebarCard = document.createElement("sidebar-card") as SidebarCard;
  sidebarCard.setConfig(config);
  sidebarCard.hass = hass();

  sidebar.appendChild(sidebarCard);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getConfig() {
  let lovelace: any;
  while(!lovelace) {
    lovelace = getLovelace();
    if(!lovelace) {
      await sleep(500);
    }
  }

  return lovelace;
}

async function buildSidebar() {
  let lovelace = await getConfig();
  if(lovelace.config.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if(!sidebarConfig.width || (sidebarConfig.width && typeof sidebarConfig.width == 'number' && sidebarConfig.width > 0 && sidebarConfig.width < 100 ) || (sidebarConfig.width && typeof sidebarConfig.width == 'object')) {
      let root = getRoot();
      if(sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true) {
        root.shadowRoot.querySelector('ch-header').style.display = 'none';
      }
      if(!sidebarConfig.breakpoints) {
        sidebarConfig.breakpoints = {
          'tablet': 1024,
          'mobile': 768
        }
      } else if(sidebarConfig.breakpoints) {
        if(!sidebarConfig.breakpoints.mobile) {
          sidebarConfig.breakpoints.mobile = 768;
        }
        if(!sidebarConfig.breakpoints.tablet) {
          sidebarConfig.breakpoints.tablet = 1024;
        }
      }
      
      let appLayout = root.shadowRoot.querySelector('ha-app-layout');
      let css = createCSS(sidebarConfig, document.body.clientWidth);
      let style: any = document.createElement('style');
      style.setAttribute('id', 'customSidebarStyle');
      appLayout.shadowRoot.appendChild(style);
      style.type = 'text/css';
      if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      // get element to wrap
      let contentContainer:any = appLayout.shadowRoot.querySelector('#contentContainer');
      // create wrapper container
      var wrapper = document.createElement('div');
      wrapper.setAttribute('id', 'customSidebarWrapper');
      // insert wrapper before el in the DOM tree
      contentContainer.parentNode.insertBefore(wrapper, contentContainer);
      // move el into wrapper
      let sidebar = document.createElement('div');
      sidebar.setAttribute('id', 'customSidebar');
      wrapper.appendChild(sidebar);
      wrapper.appendChild(contentContainer);
      await buildCard(sidebar, sidebarConfig);
      update(appLayout, sidebarConfig);
      subscribeEvens(appLayout, sidebarConfig, contentContainer, sidebar);
    } else {
      console.log('Error sidebar in width config!');
    }
  } else {
    console.log('No sidebar in config found!');
  }
}

buildSidebar();

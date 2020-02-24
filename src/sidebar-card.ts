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
    const sidebarMenuColor = this.config.sidebarMenuColor;
    const title = "title" in this.config ? this.config.title : false;
    const clock = this.config.clock && this.hass.states['sensor.time'] ? this.config.clock : false;
    const textColor = "textColor" in this.config ? this.config.textColor : false;
    const addStyle = "style" in this.config ? true : false;
    return html`
      ${addStyle ? html`
        <style>
          ${this.config.style}
        </style>
      ` : html``}
      <div class="sidebar-inner">
        ${clock ? html `<h1 class="clock${title ? ' with-title':''}" style="${textColor ? 'color:'+textColor : ''}">${this.hass.states['sensor.time'].state}</h1>`: html ``}
        ${title ? html `<h1 style="${textColor ? 'color:'+textColor : ''}">${title}</h1>`: html ``}
        
        ${this.config.template ? html`
          <ul class="template" style="${textColor ? 'color:'+textColor : ''}">
            ${this.templateLines.map(line => {
              return html`<li>${line}</li>`;
            })}
          </ul>
        ` : html``}
        ${sidebarMenu.length > 0 ? html`
        <ul class="sidebarMenu" style="${sidebarMenuColor ? 'color:'+sidebarMenuColor : ''}">
          ${sidebarMenu.map(sidebarMenuItem => {
            return html`<li @click="${e => this._menuAction(e)}" data-path="${sidebarMenuItem.navigation_path ? sidebarMenuItem.navigation_path : ''}" data-menuitem="${JSON.stringify(sidebarMenuItem)}" data->${sidebarMenuItem.name}</li>`;
          })}
        </ul>
        ` : html ``}
      </div>
    `;
  }

  firstUpdated() {
    getRoot().querySelectorAll("paper-tab").forEach(paperTab => {
      paperTab.addEventListener('click', () => {
        this._updateActiveMenu();
      })
    });
  }
  
  updated() { }

  _updateActiveMenu() {
    this.shadowRoot.querySelectorAll('ul.sidebarMenu li').forEach(menuItem => {
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
    if (!config.sidebarMenu) {
      throw new Error("You need to define sidebarMenu");
    }
    this.config = config;

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
        }
        .sidebar-inner {
          padding: 20px;
        }
        .sidebarMenu {
          list-style:none;
          margin: 0;
          padding: 0;
        }
        .sidebarMenu li {
          padding: 10px 20px;
          border-radius: 12px;
          color:inherit;
          font-size:20px;
          font-weight:300;
          white-space: normal;
          display:block;
        }
        .sidebarMenu li.active {
          background-color: rgba(0,0,0,0.2);
        }

        h1 {
          margin-top:0;
          margin-bottom: 30px;
          font-size: 32px;
          font-weight: 300;
        }
        h1.clock {
          font-size:60px;
        }
        h1.clock.with-title {
          margin-bottom:0;
        }
        .template {
          margin: 0;
          padding: 0;
          list-style:none;
        }
        
        .template li {
          display:block;
          color:inherit;
          font-size:20px;
          font-weight:300;
          white-space: normal;
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
    }
  `;
  if(sidebarResponsive) {
    if(width <= sidebarConfig.breakpoints.mobile) {
      css += `
      #customSidebar {
        width:`+sidebarConfig.width.mobile+`%;
      } 
      #contentContainer {
        width:`+(100 - sidebarConfig.width.mobile)+`%;
      }
    `;
    } else if (width <= sidebarConfig.breakpoints.tablet) {
        css += `
        #customSidebar {
          width:`+sidebarConfig.width.tablet+`%;
        } 
        #contentContainer {
          width:`+(100 - sidebarConfig.width.tablet)+`%;
        }
      `;
    } else {
        css += `
        #customSidebar {
          width:`+sidebarConfig.width.desktop+`%;
        } 
        #contentContainer {
          width:`+(100 - sidebarConfig.width.desktop)+`%;
        }
      `;
    }
  } else {
    css += `
      #customSidebar {
        width:`+sidebarWidth+`%;
      } 
      #contentContainer {
        width:`+contentWidth+`%;
      }
    `;
  }
  return css
}

function subscribeEvens(appLayout: any, sidebarConfig) {
  let root: any = getRoot();
  window.addEventListener('resize', function() {
    const width = document.body.clientWidth;
    appLayout.shadowRoot.querySelector('#customSidebarStyle').textContent = createCSS(sidebarConfig, width);
    if(sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true && sidebarConfig.showTopMenuOnMobile && sidebarConfig.showTopMenuOnMobile === true && width <= sidebarConfig.breakpoints.mobile) {
      console.log('displayMobile');
      root.querySelector('ch-header').style.display = 'flex';
    } else if(sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true) {
      root.querySelector('ch-header').style.display = 'none';
    }
  }, true);
}

async function buildCard(sidebar, config) {
  config.type = 'custom:sidebar-card';
  const sidebarCard = createCard(config);
  sidebarCard.hass = hass();
  sidebar.appendChild(sidebarCard);
  return new Promise((resolve) =>
    sidebarCard.updateComplete ? sidebarCard.updateComplete.then(() => resolve(sidebarCard)): resolve(sidebarCard)
  );
}
async function buildSidebar() {
  let lovelace = getLovelace();
  if(lovelace.config.sidebar) {
    const sidebarConfig = lovelace.config.sidebar;
    if(!sidebarConfig.width || (sidebarConfig.width && typeof sidebarConfig.width == 'number' && sidebarConfig.width > 0 && sidebarConfig.width < 100 ) || (sidebarConfig.width && typeof sidebarConfig.width == 'object')) {
      let root: any = getRoot();
      
      if(sidebarConfig.hideTopMenu && sidebarConfig.hideTopMenu === true) {
        root.querySelector('ch-header').style.display = 'none';
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
      
      let appLayout = root.querySelector('ha-app-layout');
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
      subscribeEvens(appLayout, sidebarConfig);
    } else {
      console.log('Error sidebar in width config!');
    }
  } else {
    console.log('No sidebar in config found!');
  }
}

buildSidebar();

// class SidebarCard extends LitElement {
//   config: any;
//   hass: any;
//   shadowRoot: any;
//   renderCard: any;
//   templateLines: any = [];

//   static get properties() {
//     return {
//       hass: {},
//       config: {},
//       active: {}
//     };
//   }
  
//   constructor() {
//     super();
//   }
  
//   render() {
//     const sidebarMenu = this.config.sidebarMenu;
//     const sidebarMenuColor = this.config.sidebarMenuColor;
//     const title = "title" in this.config ? this.config.title : false;
//     const clock = this.config.clock && this.hass.states['sensor.time'] ? this.config.clock : false;
//     const textColor = "textColor" in this.config ? this.config.textColor : false
//     return html`
//       <div id="wrapper">

//         <div id="sidebar">
//           ${clock ? html `<h1 style="${textColor ? 'color:'+textColor : ''}">${this.hass.states['sensor.time'].state}</h1>`: html ``}
//           ${title ? html `<h1 style="${textColor ? 'color:'+textColor : ''}">${title}</h1>`: html ``}
          
//           <ul class="template" style="${textColor ? 'color:'+textColor : ''}">
//             ${this.templateLines.map(line => {
//               return html`<li>${line}</li>`;
//             })}
//           </ul>
//           ${sidebarMenu.length > 0 ? html`
//           <ul class="sidebarMenu" style="${sidebarMenuColor ? 'color:'+sidebarMenuColor : ''}">
//             ${sidebarMenu.map(sidebarMenuItem => {
//               return html`<li @click="${e => this._menuAction(e)}" class="${sidebarMenuItem.active ? 'active':''}" data-menuitem="${JSON.stringify(sidebarMenuItem)}" data->${sidebarMenuItem.name}</li>`;
//             })}
//           </ul>
//         ` : html ``}
//         </div>
//         <div id="cards">
//         </div>

//       </div>
//     `;
//   }

//   async build_card(card) {
//     const el = createCard(card);
//     el.hass = hass();
//     this.shadowRoot.querySelector("#cards").appendChild(el);
//     return new Promise((resolve) =>
//       el.updateComplete
//         ? el.updateComplete.then(() => resolve(el))
//         : resolve(el)
//       );
//   }

//   async build_cards() {
//     // Clear out any cards in the staging area which might have been built but not placed
//     const cards = this.shadowRoot.querySelector("#cards");
//     while(cards.lastChild)
//     cards.removeChild(cards.lastChild);
//     return Promise.all(this.config.cards.map((c) => this.build_card(c)));
//   }

//   firstUpdated() {
    
//   }
  
//   async updated() {
//     await this.build_cards();
//   }

//   _menuAction(e) {
//     if(e.target.dataset && e.target.dataset.menuitem) {
//       const menuItem = JSON.parse(e.target.dataset.menuitem);
//       this._customAction(menuItem);
//     }
//   }

//   _customAction(tapAction) {
//     switch (tapAction.action) {
//       case "more-info":
//         if (tapAction.entity || tapAction.camera_image) {
//           moreInfo(tapAction.entity ? tapAction.entity : tapAction.camera_image!);
//         }
//         break;
//       case "navigate":
//         if (tapAction.navigation_path) {
//           navigate(window, tapAction.navigation_path);
//         }
//         break;
//       case "url":
//         if (tapAction.url_path) {
//           window.open(tapAction.url_path);
//         }
//         break;
//       case "toggle":
//         if (tapAction.entity) {
//           toggleEntity(this.hass, tapAction.entity!);
//           forwardHaptic("success");
//         }
//         break;
//       case "call-service": {
//         if (!tapAction.service) {
//           forwardHaptic("failure");
//           return;
//         }
//         const [domain, service] = tapAction.service.split(".", 2);
//         this.hass.callService(domain, service, tapAction.service_data);
//         forwardHaptic("success");
//       }
//     }
//   }
  
//   setConfig(config) {
//     if (!config.sidebarMenu) {
//       throw new Error("You need to define sidebarMenu");
//     }
//     if (!config.cards) {
//       throw new Error("You need to define cards");
//     }
//     this.config = config;

//     subscribeRenderTemplate(null, (res) => {
//       console.log('RENDER TEMPLATE RESULT');
//       console.log(res);
//       var result = res.match(/<li>(.*?)<\/li>/gs).map(function(val){
//         return val.replace(/<\/?li>/g,'');
//       });
//       this.templateLines = result;
//       console.log(this.templateLines);
//     }, {
//       template: this.config.template,
//       variables: {config: this.config},
//       entity_ids: this.config.entity_ids,
//     });
//   }

//   getCardSize() {
//     return 1;
//   }
  
//   static get styles() {
//     return css`
//         :host {}
//         #wrapper {
//           display:flex;
//           flex-direction:row;
//         }

//         #wrapper #sidebar {
//           width:25%;
//           margin:0 25px;
//         }

//         #wrapper #cards {
//           width:75%;
//           margin:0 25px;
//         }

//         #sidebar .sidebarMenu {
//           list-style:none;
//           margin:0 0 30px 4px;
//           padding: 0 16px 0 0;
//         }
//         #sidebar  .sidebarMenu li {
//           padding: 10px 20px;
//           border-radius: 12px;
//           color:inherit;
//           font-size:20px;
//           font-weight:300;
//           white-space: normal;
//           display:block;
//         }
//         #sidebar .sidebarMenu li.active {
//           background-color: rgba(0,0,0,0.2);
//         }

//         #sidebar h1 {
//           margin-bottom: 30px;
//           margin-left: 4px;
//           font-size: 32px;
//           font-weight: 300;
//         }
//         #sidebar .template {
//           margin:0 0 30px 4px;
//           padding: 0 16px 0 0;
//           list-style:none;
//         }
        
//         #sidebarul .template li {
//           display:block;
//           color:inherit;
//           font-size:20px;
//           font-weight:300;
//           white-space: normal;
//         }
//     `;
//   }  
  
// }

// customElements.define('sidebar-card', SidebarCard);

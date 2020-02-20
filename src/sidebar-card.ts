import { LitElement, html, css} from "card-tools/src/lit-element";
import { moreInfo } from "card-tools/src/more-info";
import { createCard } from "card-tools/src/lovelace-element";
import { hass } from "card-tools/src/hass";
import {
  toggleEntity,
  navigate,
  forwardHaptic,
  getRoot
} from 'custom-card-helpers';
class SidebarCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;
  renderCard: any;

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
    
    return html`
      <div id="wrapper">

        <div id="sidebar">
          ${sidebarMenu.length > 0 ? html`
          <ul class="sidebarMenu" style="${sidebarMenuColor ? 'color:'+sidebarMenuColor : ''}">
            ${sidebarMenu.map(sidebarMenuItem => {
              return html`<li @click="${e => this._menuAction(e)}" class="${sidebarMenuItem.active ? 'active':''}" data-menuitem="${JSON.stringify(sidebarMenuItem)}" data->${sidebarMenuItem.name}</li>`;
            })}
          </ul>
        ` : html ``}
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

  firstUpdated() {
    
  }
  
  async updated() {
    await this.build_cards();
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
    if (!config.cards) {
      throw new Error("You need to define cards");
    }
    this.config = config;
  }

  getCardSize() {
    return 1;
  }
  
  static get styles() {
    return css`
        :host {}
        #wrapper {
          display:flex;
          flex-direction:row;
        }

        #wrapper #sidebar {
          width:25%;
        }

        #wrapper #cards {
          width:75%;
        }

        #sidebar  .sidebarMenu {
          list-style:none;
          margin:0 0 30px 4px;
          padding: 0 16px 0 0;
        }
        #sidebar  .sidebarMenu li {
          padding: 10px 20px;
          border-radius: 12px;
        }
        #sidebar .sidebarMenu li.active {
          background-color: rgba(0,0,0,0.2);
        }
    `;
  }  
  
}

customElements.define('sidebar-card', SidebarCard);

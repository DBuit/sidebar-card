import { provideHass } from "./hass";
import { selectTree } from "./helpers";
import { fireEvent } from "./event";
import "./lovelace-element";

export async function closePopUp() {
  const root = document.querySelector("home-assistant") || document.querySelector("hc-root");
  fireEvent("hass-more-info", {entityId: "."}, root);
  const el = await selectTree(root, "$ card-tools-popup");

  if(el)
    el.closeDialog();
}

export async function popUp(title, card, large=false, style={}, fullscreen=false) {
  if(!customElements.get("card-tools-popup"))
  {
    const LitElement = customElements.get('home-assistant-main')
      ? Object.getPrototypeOf(customElements.get('home-assistant-main'))
      : Object.getPrototypeOf(customElements.get('hui-view'));
    const html = LitElement.prototype.html;
    const css = LitElement.prototype.css;

      class CardToolsPopup extends LitElement {

        static get properties() {
          return {
            open: {},
            large: {reflect: true, type: Boolean},
            hass: {},
          };
        }

        updated(changedProperties) {
          if(changedProperties.has("hass")) {
            if(this.card)
              this.card.hass = this.hass;
          }
        }

        closeDialog() {
          this.open = false;
        }

        async _makeCard() {
          const helpers = await window.loadCardHelpers();
          this.card = await helpers.createCardElement(this._card);
          this.card.hass = this.hass;
          this.requestUpdate();
        }

        async _applyStyles() {
          let el = await selectTree(this, "$ ha-dialog");
          customElements.whenDefined("card-mod").then(async () => {
          if(!el) return;
            const cm = customElements.get("card-mod");
            cm.applyToElement(el, "more-info", this._style, {config: this._card}, [], false);
          });

        }

        async showDialog(title, card, large=false, style={}, fullscreen=false) {
          this.title = title;
          this._card = card;
          this.large = large;
          this._style = style;
          this.fullscreen = !!fullscreen;
          this._makeCard();
          await this.updateComplete;
          this.open = true;
          await this._applyStyles();
        }

        _enlarge() {
          this.large = !this.large;
        }

        render() {
          if(!this.open) {
            return html``;
          }

          return html`
            <ha-dialog
              open
              @closed=${this.closeDialog}
              .heading=${true}
              hideActions
              @ll-rebuild=${this._makeCard}
            >
            ${this.fullscreen
              ? html`<div slot="heading"></div>`
              : html`
                <app-toolbar slot="heading">
                  <mwc-icon-button
                    .label=${"dismiss"}
                    dialogAction="cancel"
                  >
                    <ha-icon
                      .icon=${"mdi:close"}
                    ></ha-icon>
                  </mwc-icon-button>
                  <div class="main-title" @click=${this._enlarge}>
                    ${this.title}
                  </div>
                </app-toolbar>
              `}
              <div class="content">
                ${this.card}
              </div>
            </ha-dialog>
          `
        }

        static get styles() {
          return css`
          ha-dialog {
            --mdc-dialog-min-width: 400px;
            --mdc-dialog-max-width: 600px;
            --mdc-dialog-heading-ink-color: var(--primary-text-color);
            --mdc-dialog-content-ink-color: var(--primary-text-color);
            --justify-action-buttons: space-between;
          }
          @media all and (max-width: 450px), all and (max-height: 500px) {
            ha-dialog {
              --mdc-dialog-min-width: 100vw;
              --mdc-dialog-max-width: 100vw;
              --mdc-dialog-min-height: 100%;
              --mdc-dialog-max-height: 100%;
              --mdc-shape-medium: 0px;
              --vertial-align-dialog: flex-end;
            }
          }

          app-toolbar {
            flex-shrink: 0;
            color: var(--primary-text-color);
            background-color: var(--secondary-background-color);
          }

          .main-title {
            margin-left: 16px;
            line-height: 1.3em;
            max-height: 2.6em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
          }
          .content {
            margin: -20px -24px;
          }

          @media all and (max-width: 450px), all and (max-height: 500px) {
            app-toolbar {
              background-color: var(--app-header-background-color);
              color: var(--app-header-text-color, white);
            }
          }

          @media all and (min-width: 451px) and (min-height: 501px) {
            ha-dialog {
              --mdc-dialog-max-width: 90vw;
            }

            .content {
              width: 400px;
            }
            :host([large]) .content {
              width: calc(90vw - 48px);
            }

            :host([large]) app-toolbar {
              max-width: calc(90vw - 32px);
            }
          }
          `;
        }

      }
    customElements.define("card-tools-popup", CardToolsPopup);
  }

  const root = document.querySelector("home-assistant") || document.querySelector("hc-root");

  if(!root) return;
  let el = await selectTree(root, "$ card-tools-popup");
  if(!el) {
    el = document.createElement("card-tools-popup");
    const mi = root.shadowRoot.querySelector("ha-more-info-dialog");
    if(mi)
      root.shadowRoot.insertBefore(el,mi);
    else
      root.shadowRoot.appendChild(el);
    provideHass(el);
  }

  if(!window._moreInfoDialogListener) {
    const listener = async (ev) => {
      if(ev.state && "cardToolsPopup" in ev.state) {
        if(ev.state.cardToolsPopup) {
          const {title, card, large, style, fullscreen} = ev.state.params;
          popUp(title, card, large, style, fullscreen)
        } else {
          el.closeDialog();
        }
      }
    }

    window.addEventListener("popstate", listener);
    window._moreInfoDialogListener = true;
  }

  history.replaceState( {
      cardToolsPopup: false,
    },
    ""
  );

  history.pushState( {
      cardToolsPopup: true,
      params: {title, card, large, style, fullscreen},
    },
    ""
  );

  el.showDialog(title, card, large, style, fullscreen);

}

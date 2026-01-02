// src/HeaderCard.ts

import { css, html, LitElement } from 'lit-element';
import { provideHass, hass as getHass } from 'card-tools/src/hass';
import { moreInfo } from 'card-tools/src/more-info';
import { forwardHaptic, navigate, toggleEntity } from 'custom-card-helpers';
import type { HomeAssistant } from 'custom-card-helpers';

type AnyObj = Record<string, any>;

export class HeaderCard extends LitElement {
  public config!: AnyObj;
  public hass!: AnyObj;

  // Evita ricostruzioni inutili
  private _builtOnce = false;
  private _lastCardConfigKey = '';

  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  setConfig(config: AnyObj) {
    this.config = config;
  }

  firstUpdated() {
    provideHass(this);
    this._applyHeight();
    this._ensureAllCards();
    this._builtOnce = true;
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('config')) {
      this._applyHeight();
      this._ensureAllCards();
    }
    if (changedProps.has('hass') && this._builtOnce) {
      this._pushHassToBuiltCards();
    }
  }

  private _applyHeight() {
    const h = Number(this.config?.height);
    // Non mettiamo più un height fisso sull'host,
    // ma solo una variabile CSS usata come min-height
    if (Number.isFinite(h) && h > 0) {
      this.style.setProperty('--header-height', `${h}px`);
    } else {
      this.style.removeProperty('--header-height');
    }
  }

  // -----------------------
  // Card mounting helpers
  // -----------------------

  private _pushHassToBuiltCards() {
    const root = this.renderRoot as ShadowRoot;
    const nodes = root.querySelectorAll(
      '#slotLeft > *, #slotCenter > *, #slotRight > *',
    ) as NodeListOf<any>;
    const h = (this.hass ?? getHass()) as any;

    nodes.forEach((el) => {
      try {
        el.hass = h;
      } catch (_e) {
        // ignore
      }
    });
  }

  private async _buildCardInto(container: HTMLElement, cardCfg: AnyObj | null) {
    // Token per invalidare i build "vecchi" su questo container
    const token = Symbol('headerBuild');
    (container as any).__headerBuildToken = token;

    // Pulisco sempre il contenitore
    container.innerHTML = '';
    if (!cardCfg || typeof cardCfg !== 'object' || !cardCfg.type) return;

    let tag = String(cardCfg.type);
    if (tag.startsWith('custom:')) {
      tag = tag.substring('custom:'.length);
    } else {
      tag = `hui-${tag}-card`;
    }

    const createAndAttach = () => {
      // Se nel frattempo è partito un altro build per questo container, esco
      if ((container as any).__headerBuildToken !== token) return;

      const el: any = document.createElement(tag);
      if (typeof el.setConfig !== 'function') return;

      el.setConfig(cardCfg);
      el.hass = (this.hass ?? getHass()) as any;
      container.appendChild(el);
      provideHass(el);
    };

    if (customElements.get(tag)) {
      // custom element già registrato → attach immediato
      createAndAttach();
      return;
    }

    // custom element ancora non pronto → aspetto, ma solo l'ultimo build vince
    try {
      await customElements.whenDefined(tag);
      createAndAttach();
    } catch (_e) {
      // ignore
    }
  }
  

  private _ensureAllCards() {
    const root = this.renderRoot as ShadowRoot;
    const cfg: AnyObj = this.config || {};

    // Chiave che rappresenta le config delle tre card
    const cardKey = JSON.stringify({
      left: cfg.leftCard ?? null,
      center: cfg.centerCard ?? null,
      right: cfg.rightCard ?? null,
    });

    // Se la config non è cambiata, NON ricostruiamo
    if (cardKey === this._lastCardConfigKey && this._builtOnce) {
      return;
    }
    this._lastCardConfigKey = cardKey;

    const left = root.querySelector('#slotLeft') as HTMLElement | null;
    const center = root.querySelector('#slotCenter') as HTMLElement | null;
    const right = root.querySelector('#slotRight') as HTMLElement | null;

    if (left) void this._buildCardInto(left, cfg.leftCard ?? null);
    if (center) void this._buildCardInto(center, cfg.centerCard ?? null);
    if (right) void this._buildCardInto(right, cfg.rightCard ?? null);
  }

  // -----------------------
  // Actions
  // -----------------------

  private _runAction(ev: Event, tapAction: AnyObj) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    const action = tapAction?.action;

    switch (action) {
      case 'navigate':
        if (tapAction?.navigation_path) {
          navigate(window, tapAction.navigation_path);
          forwardHaptic('success');
        }
        break;

      case 'toggle':
        if (tapAction?.entity) {
          const h = (this.hass ??
            (getHass() as unknown as HomeAssistant)) as HomeAssistant;
          toggleEntity(h, tapAction.entity);
          forwardHaptic('success');
        }
        break;

      case 'more-info':
        if (tapAction?.entity) {
          moreInfo(tapAction.entity);
          forwardHaptic('success');
        }
        break;

      case 'call-service': {
        if (!tapAction?.service) {
          forwardHaptic('failure');
          return;
        }
        const [domain, service] = String(tapAction.service).split('.', 2);
        (this.hass ?? getHass()).callService(
          domain,
          service,
          tapAction.service_data,
        );
        forwardHaptic('success');
        break;
      }

      case 'service-js': {
        if (tapAction?.service) {
          try {
            const code = String(tapAction.service).replace(
              /^\[\[\[\s*|\s*\]\]\]$/g,
              '',
            );
            // eslint-disable-next-line no-new-func
            const func = new Function(code);
            func.call(this);
            forwardHaptic('success');
          } catch (_err) {
            forwardHaptic('failure');
          }
        } else {
          forwardHaptic('failure');
        }
        break;
      }

      default:
        break;
    }
  }

  private _renderHeaderMenuItem(item: AnyObj, showLabel: boolean) {
    const bg = item?.background_color || '';
    const iconColor = item?.icon_color || '';
    const textColor = item?.text_color || '';

    const styleStr = `
      ${bg ? `--header-item-bg:${bg};` : ''}
      ${iconColor ? `--header-item-icon-color:${iconColor};` : ''}
      ${textColor ? `--header-item-text-color:${textColor};` : ''}
    `;

    return html`
      <button
        class="header-item"
        style="${styleStr}"
        title="${item?.name || ''}"
        aria-label="${item?.name || ''}"
        @click=${(ev: Event) => this._runAction(ev, item)}
      >
        ${item?.icon
          ? html`
              <ha-icon class="header-icon" icon="${item.icon}"></ha-icon>
            `
          : html``}
        ${showLabel && item?.name
          ? html`<span class="header-label">${item.name}</span>`
          : html``}
      </button>
    `;
  }

  // -----------------------
  // Render
  // -----------------------

  render() {
    const cfg: AnyObj = this.config || {};
    const addStyle = typeof cfg.style === 'string' && cfg.style.trim().length > 0;

    const title = 'title' in cfg ? cfg.title : '';
    const leftMenu = Array.isArray(cfg.leftMenu) ? cfg.leftMenu : [];
    const rightMenu = Array.isArray(cfg.rightMenu) ? cfg.rightMenu : [];

    const menuItems = Array.isArray(cfg.headerMenu) ? cfg.headerMenu : [];
    const menuStyle = cfg.headerMenuStyle || 'wide';
    const showLabel = cfg.headerMenuShowLabel !== false; // default true
    const menuPosition = cfg.headerMenuPosition || 'right'; // left|center|right

    const menuTpl =
      menuItems.length
        ? html`
            <div class="headerMenuWrap">
              <div
                class="headerMenu
                ${menuStyle === 'wide' ? 'headerMenu--wide' : ''}
                ${showLabel ? 'with-label' : 'no-label'}"
              >
                ${menuItems.map((item: AnyObj) =>
                  this._renderHeaderMenuItem(item, showLabel),
                )}
              </div>
            </div>
          `
        : html``;

    return html`
      ${addStyle
        ? html`
            <style>
              ${cfg.style}
            </style>
          `
        : html``}

      <div class="header-inner">
        <!-- LEFT AREA (sempre visibile) -->
        <div class="area area-left">
          ${leftMenu.length
            ? html`
                <div class="iconMenu iconMenu-left">
                  ${leftMenu.map(
                    (item: AnyObj) => html`
                      <button
                        class="iconBtn"
                        title="${item?.name || ''}"
                        aria-label="${item?.name || ''}"
                        @click=${(ev: Event) => this._runAction(ev, item)}
                      >
                        ${item?.icon
                          ? html`<ha-icon icon="${item.icon}"></ha-icon>`
                          : html``}
                      </button>
                    `,
                  )}
                </div>
              `
            : html``}

          ${menuPosition === 'left' ? menuTpl : html``}

          <div class="header-card-slot header-slot-left">
            <div id="slotLeft"></div>
          </div>
        </div>

        <!-- CENTER CORRIDOR (scroll orizzontale, niente sovrapposizioni) -->
        <div class="area area-center">
          <div class="center-scroll">
            <div class="header-card-slot header-slot-center">
              <div id="slotCenter"></div>
            </div>

            ${menuPosition === 'center' ? menuTpl : html``}

            ${title ? html`<div class="title">${title}</div>` : html``}
          </div>
        </div>

        <!-- RIGHT AREA (sempre visibile) -->
        <div class="area area-right">
          <div class="header-card-slot header-slot-right">
            <div id="slotRight"></div>
          </div>

          ${menuPosition === 'right' ? menuTpl : html``}

          ${rightMenu.length
            ? html`
                <div class="iconMenu iconMenu-right">
                  ${rightMenu.map(
                    (item: AnyObj) => html`
                      <button
                        class="iconBtn"
                        title="${item?.name || ''}"
                        aria-label="${item?.name || ''}"
                        @click=${(ev: Event) => this._runAction(ev, item)}
                      >
                        ${item?.icon
                          ? html`<ha-icon icon="${item.icon}"></ha-icon>`
                          : html``}
                      </button>
                    `,
                  )}
                </div>
              `
            : html``}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        width: 100%;
        display: block;
        box-sizing: border-box;
        background: transparent;
        color: var(--header-text-color, var(--primary-text-color));
        /* lasciamo decidere all'altezza del contenuto;
           min-height gestita via --header-height in .header-inner */
      }

      .header-inner {
        width: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        gap: clamp(6px, 1.2vw, 12px);
        min-width: 0;
        /* Altezza minima configurabile, ma può crescere se le card sono più alte */
        min-height: var(--header-height, 72px);
      }

      .area {
        display: flex;
        align-items: center;
        min-width: 0;
        gap: clamp(6px, 1.2vw, 12px);
      }

      .area-left,
      .area-right {
        flex: 0 0 auto; /* sempre visibili */
      }

      .area-center {
        flex: 1 1 auto; /* si adatta */
        min-width: 0;
      }

      .header-card-slot {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      /* contenitori che ospitano le card */
      #slotLeft,
      #slotCenter,
      #slotRight {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      /* CENTER: un solo corridoio scrollabile */
      .center-scroll {
        display: flex;
        align-items: center;
        gap: clamp(6px, 1.2vw, 12px);
        min-width: 0;
        flex: 1 1 auto;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
      }

      /* icon menu */
      .iconMenu {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }

      .iconBtn {
        width: clamp(34px, 3.2vw, 40px);
        height: clamp(34px, 3.2vw, 40px);
        border-radius: 999px;
        border: 0;
        cursor: pointer;
        background: transparent;
        color: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .iconBtn:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      /* HEADER MENU */
      .headerMenuWrap {
        display: flex;
        align-items: center;
        min-width: 0;
        flex: 0 0 auto;
      }

      .headerMenu {
        display: flex;
        align-items: center;
        gap: clamp(6px, 1.2vw, 10px);
        min-width: 0;
        flex: 0 0 auto;
      }

      .headerMenu.headerMenu--wide .header-item {
        height: clamp(38px, 3.8vw, 44px);
        padding: 0 clamp(10px, 1.6vw, 14px);
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 0;
        cursor: pointer;
        background: var(--header-item-bg, rgba(255, 255, 255, 0.14));
        color: var(--header-item-text-color, inherit);
        box-sizing: border-box;
        white-space: nowrap;
        flex: 0 0 auto;
      }

      .headerMenu.headerMenu--wide .header-icon {
        color: var(--header-item-icon-color, currentColor);
      }

      .headerMenu.no-label .header-label {
        display: none !important;
      }

      .header-item:hover {
        filter: brightness(1.02);
      }

      /* titolo opzionale (se lo userai in futuro) */
      .title {
        display: none;
      }
    `;
  }
}

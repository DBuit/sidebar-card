// src/sidebar-card.ts
// ------------------------------------------------------------------------------------------
//  SIDEBAR-CARD – ENTRY POINT
//  Build wrapper + CSS originali + inject HeaderCard separato
// ------------------------------------------------------------------------------------------

import { SidebarCard } from './SidebarCard';
import { HeaderCard } from './HeaderCard';

import { hass, provideHass } from 'card-tools/src/hass';

import {
  SIDEBAR_CARD_TITLE,
  getConfig,
  getRoot,
  getSidebar,
  getAppDrawerLayout,
  getAppDrawer,
  getParameterByName,
  createCSS,
  updateStyling,
  subscribeEvents,
  watchLocationChange,
  log2console,
  error2console,
} from './helpers';

const SIDEBAR_CARD_VERSION = '1.0';

let ALREADY_BUILT = false;

// --- ResizeObserver types (in case DOM lib not enabled) ---
type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver
) => void;

interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
}

declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback);
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

declare global {
  interface Window {
    ResizeObserver: typeof ResizeObserver;
  }
}


async function buildSidebarCard(container: HTMLElement, config: any) {
  const el = document.createElement('sidebar-card') as SidebarCard;
  el.setConfig(config);
  el.hass = hass();
  container.appendChild(el);
}

async function buildHeaderCard(container: HTMLElement, config: any) {
  let headerEl = container.querySelector('header-card') as any;
  if (!headerEl) {
    headerEl = document.createElement('header-card') as any;
    container.appendChild(headerEl);
    provideHass(headerEl);
  }
  headerEl.setConfig(config);
  headerEl.hass = hass();
}

async function build() {
  if (ALREADY_BUILT) return;

  const lovelace = await getConfig();
  const sidebarConfig = lovelace?.config?.sidebar ?? null;
  const headerConfig = lovelace?.config?.header ?? null;

  if (!sidebarConfig && !headerConfig) {
    log2console('build', 'No sidebar/header config found');
    return;
  }

  const root = getRoot();
  if (!root || !root.shadowRoot) {
    error2console('build', 'Root element or shadowRoot not found!');
    return;
  }

  const hassSidebar = getSidebar();
  const appDrawerLayout = getAppDrawerLayout();
  const appDrawer = getAppDrawer();
  const offParam = getParameterByName('sidebarOff');

  const appLayout = root.shadowRoot.querySelector('div') as HTMLElement | null;
  if (!appLayout) {
    error2console('build', 'App layout not found');
    return;
  }

  // ---------------------------
  // SIDEBAR (original builder)
  // ---------------------------
  if (
    sidebarConfig &&
    sidebarConfig.enabled !== false &&
    (
      !sidebarConfig.width ||
      (typeof sidebarConfig.width === 'number' &&
        sidebarConfig.width > 0 &&
        sidebarConfig.width < 100) ||
      typeof sidebarConfig.width === 'object'
    )
  )
   {
    if (!appLayout.querySelector('#customSidebarWrapper')) {
      if (sidebarConfig.hideTopMenu === true && offParam == null) {
        if (root.shadowRoot.querySelector('ch-header'))
          (root.shadowRoot.querySelector('ch-header') as HTMLElement).style.display = 'none';
        if (root.shadowRoot.querySelector('app-header'))
          (root.shadowRoot.querySelector('app-header') as HTMLElement).style.display = 'none';
        if (root.shadowRoot.querySelector('ch-footer'))
          (root.shadowRoot.querySelector('ch-footer') as HTMLElement).style.display = 'none';
        if (root.shadowRoot.getElementById('view'))
          (root.shadowRoot.getElementById('view') as HTMLElement).style.minHeight = 'calc(100vh)';
      }

      if (sidebarConfig.hideHassSidebar === true && offParam == null) {
        if (hassSidebar) hassSidebar.style.display = 'none';
        if (appDrawerLayout) {
          appDrawerLayout.style.marginLeft = '0';
          appDrawerLayout.style.paddingLeft = '0';
        }
        if (appDrawer) appDrawer.style.display = 'none';
      }

      if (!sidebarConfig.breakpoints) {
        sidebarConfig.breakpoints = { tablet: 1024, mobile: 768 };
      } else {
        if (!sidebarConfig.breakpoints.mobile) sidebarConfig.breakpoints.mobile = 768;
        if (!sidebarConfig.breakpoints.tablet) sidebarConfig.breakpoints.tablet = 1024;
      }

      const css = createCSS(sidebarConfig, document.body.clientWidth);
      const style = document.createElement('style');
      style.id = 'customSidebarStyle';
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      appLayout.appendChild(style);

      const contentContainer = appLayout.querySelector('#view') as HTMLElement | null;
      if (!contentContainer || !contentContainer.parentNode) {
        error2console('build', 'View element not found');
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.id = 'customSidebarWrapper';
      contentContainer.parentNode.insertBefore(wrapper, contentContainer);

      const sidebar = document.createElement('div');
      sidebar.id = 'customSidebar';

      wrapper.appendChild(sidebar);
      wrapper.appendChild(contentContainer);

      await buildSidebarCard(sidebar, sidebarConfig);
      subscribeEvents(appLayout, sidebarConfig, contentContainer, sidebar);

      setTimeout(() => updateStyling(appLayout, sidebarConfig), 1);
    }
  } else if (sidebarConfig) {
    error2console('build', 'Error in sidebar width config!');
  }

  // ---------------------------
  // HEADER (separato)  ✅ SOLO UNA VOLTA
  // ---------------------------
  if (headerConfig && headerConfig.enabled !== false) {
    const wrapperEl = appLayout.querySelector(
      '#customSidebarWrapper',
    ) as HTMLElement | null;
    const viewEl = appLayout.querySelector('#view') as HTMLElement | null;

    if (!viewEl) {
      error2console('build', 'View element (#view) not found for header');
    } else {
      // 1) Trova/crea host container (FUORI dal wrapper!)
      let headerHost =
        (appLayout.querySelector(
          '#customHeaderContainer',
        ) as HTMLElement | null) ||
        (document.querySelector(
          '#customHeaderContainer',
        ) as HTMLElement | null);

      if (!headerHost) {
        headerHost = document.createElement('div');
        headerHost.id = 'customHeaderContainer';
        headerHost.style.width = '100%';
        headerHost.style.boxSizing = 'border-box';
      }

      // Inserisci headerHost SOPRA wrapper (così non entra nel flex row)
      if (wrapperEl) {
        if (
          headerHost.parentElement !== appLayout ||
          headerHost.nextSibling !== wrapperEl
        ) {
          appLayout.insertBefore(headerHost, wrapperEl);
        }
      } else {
        // fallback: sopra #view
        if (viewEl.parentNode) {
          viewEl.parentNode.insertBefore(headerHost, viewEl);
        }
      }

      // 2) Crea/riusa l'elemento header-card + setConfig
      await buildHeaderCard(headerHost, headerConfig);

      // sticky: di default true, se sticky === false/0/'false' allora scorre via
      const sticky = (() => {
        const v = headerConfig.sticky;
        if (v === undefined || v === null) return true; // default: sticky ON

        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') {
          const s = v.toLowerCase().trim();
          if (s === 'false' || s === 'off' || s === '0' || s === 'no') return false;
          return true;
        }
        if (typeof v === 'number') return v !== 0;

        return true;
      })();

      // 3) (opzionale) nascondi topbar HA se vuoi usare solo la tua header
      const haTopbar =
        root.shadowRoot?.querySelector('app-header') ||
        root.shadowRoot?.querySelector('ha-top-app-bar-fixed') ||
        root.shadowRoot?.querySelector('ch-header');

      if (haTopbar instanceof HTMLElement) {
        haTopbar.style.display = 'none';
      }

      // 4) Layout header: sta SOPRA alla view, come blocco normale.
      //    Se sticky: position: sticky; top:0. Altrimenti scorre via.
      const applyHeaderLayout = () => {
        // NIENTE calcoli su view, niente marginTop/paddingTop.
        // Lasciamo che il flusso normale metta le card sotto l'header.

        if (sticky) {
          headerHost!.style.position = 'sticky';
          headerHost!.style.top = '0px';
          headerHost!.style.zIndex = '999';
        } else {
          headerHost!.style.position = '';
          headerHost!.style.top = '';
          headerHost!.style.zIndex = '';
        }

        // Assicuriamoci di non forzare altezza: ci pensa HeaderCard (min-height)
        headerHost!.style.removeProperty('height');

        // La view non viene toccata: cards sempre sotto l'header
        viewEl.style.marginTop = '';
        // NON tocchiamo il padding-top: se kiosk/card-mod lo mette, rimane com'è
      };

      applyHeaderLayout();
      requestAnimationFrame(() => applyHeaderLayout());

      // Sticky non dipende dalla width della sidebar, ma se vuoi puoi
      // comunque ri-applicare layout su resize per sicurezza:
      const key = '__sidebarCardHeaderResizeHandler';
      const prev = (window as any)[key] as
        | ((...args: any[]) => void)
        | undefined;
      if (prev) window.removeEventListener('resize', prev);

      const onResize = () => applyHeaderLayout();
      (window as any)[key] = onResize;
      window.addEventListener('resize', onResize);
    }
  } else {
    // header disabilitato: cleanup
    const headerHost = appLayout.querySelector(
      '#customHeaderContainer',
    ) as HTMLElement | null;
    if (headerHost) headerHost.remove();

    const viewEl = appLayout.querySelector('#view') as HTMLElement | null;
    if (viewEl) {
      viewEl.style.marginTop = '';
      viewEl.style.removeProperty('padding-top');
    }

    const key = '__sidebarCardHeaderResizeHandler';
    const prev = (window as any)[key] as
      | ((...args: any[]) => void)
      | undefined;
    if (prev) window.removeEventListener('resize', prev);
    delete (window as any)[key];
  }

  ALREADY_BUILT = true;
}

// Define custom elements ONCE
if (!customElements.get('sidebar-card')) customElements.define('sidebar-card', SidebarCard);
if (!customElements.get('header-card')) customElements.define('header-card', HeaderCard);

// Init banner
// eslint-disable-next-line no-console
console.info(
  `%c  ${SIDEBAR_CARD_TITLE.padEnd(24)}%c\n  Version: ${SIDEBAR_CARD_VERSION.padEnd(9)}      `,
  'color: chartreuse; background: black; font-weight: 700;',
  'color: white; background: dimgrey; font-weight: 700;',
);

build();
watchLocationChange(build);

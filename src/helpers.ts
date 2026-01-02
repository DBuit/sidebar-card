// src/helpers.ts
// ------------------------------------------------------------------------------------------
//  Helper methods (extracted from original monolithic sidebar-card.ts)
// ------------------------------------------------------------------------------------------

export const SIDEBAR_CARD_TITLE = 'SIDEBAR-CARD';

export function getLovelace() {
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

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConfig() {
  let lovelace: any;
  while (!lovelace) {
    lovelace = getLovelace();
    if (!lovelace) {
      await sleep(500);
    }
  }
  return lovelace;
}

export async function log2console(method: string, message: string, object?: any) {
  const lovelace = await getConfig();
  if (lovelace?.config?.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if (sidebarConfig.debug === true) {
      // eslint-disable-next-line no-console
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

export async function error2console(method: string, message: string, object?: any) {
  const lovelace = await getConfig();
  if (lovelace?.config?.sidebar) {
    const sidebarConfig = Object.assign({}, lovelace.config.sidebar);
    if (sidebarConfig.debug === true) {
      // eslint-disable-next-line no-console
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

export function getRoot() {
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

export function getHeaderHeightPx() {
  let headerHeightPx = '0px';
  const root = getRoot();
  if (!root || !root.shadowRoot) return headerHeightPx;

  const view = root.shadowRoot.getElementById('view') as HTMLElement | null;
  if (view && window.getComputedStyle(view) !== undefined) {
    headerHeightPx = window.getComputedStyle(view).paddingTop;
  }
  return headerHeightPx;
}

export function getSidebar() {
  let sidebar: any = document.querySelector('home-assistant');
  sidebar = sidebar && sidebar.shadowRoot;
  sidebar = sidebar && sidebar.querySelector('home-assistant-main');
  sidebar = sidebar && sidebar.shadowRoot;
  sidebar = sidebar && sidebar.querySelector('ha-drawer ha-sidebar');
  return sidebar;
}

export function getAppDrawerLayout() {
  let appDrawerLayout: any = document.querySelector('home-assistant');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('home-assistant-main');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('ha-drawer');
  appDrawerLayout = appDrawerLayout && appDrawerLayout.shadowRoot;
  appDrawerLayout = appDrawerLayout && appDrawerLayout.querySelector('.mdc-drawer-app-content');
  return appDrawerLayout;
}

export function getAppDrawer() {
  let appDrawer: any = document.querySelector('home-assistant');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('home-assistant-main');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('ha-drawer');
  appDrawer = appDrawer && appDrawer.shadowRoot;
  appDrawer = appDrawer && appDrawer.querySelector('.mdc-drawer');
  return appDrawer;
}

export function getParameterByName(name: string, url = window.location.href) {
  const parameterName = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + parameterName + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function createElementFromHTML(htmlString: string) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

export function createCSS(sidebarConfig: any, width: number) {
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
      css += `
        #customSidebar {
          width:${sidebarConfig.width.mobile}%;
          overflow:hidden;
          ${sidebarConfig.width.mobile === 0 ? 'display:none;' : ''}
          ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' + headerHeightPx + ' + env(safe-area-inset-top));'}
        } 
        #view {
          width:${100 - sidebarConfig.width.mobile}%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
        }
      `;
    } else if (width <= sidebarConfig.breakpoints.tablet) {
      css += `
        #customSidebar {
          width:${sidebarConfig.width.tablet}%;
          overflow:hidden;
          ${sidebarConfig.width.tablet === 0 ? 'display:none;' : ''}
          ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' + headerHeightPx + ' + env(safe-area-inset-top));'}
        } 
        #view {
          width:${100 - sidebarConfig.width.tablet}%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
        }
      `;
    } else {
      css += `
        #customSidebar {
          width:${sidebarConfig.width.desktop}%;
          overflow:hidden;
          ${sidebarConfig.width.desktop === 0 ? 'display:none;' : ''}
          ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' + headerHeightPx + ' + env(safe-area-inset-top));'}
        } 
        #view {
          width:${100 - sidebarConfig.width.desktop}%;
          ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
        }
      `;
    }
  } else {
    css += `
      #customSidebar {
        width:${sidebarWidth}%;
        overflow:hidden;
        ${sidebarConfig.hideTopMenu ? '' : 'margin-top: calc(' + headerHeightPx + ' + env(safe-area-inset-top));'}
      } 
      #view {
        width:${contentWidth}%;
        ${sidebarConfig.hideTopMenu ? 'padding-top:0!important;margin-top:0!important;' : ''}
      }
    `;
  }

  return css;
}

export function updateStyling(appLayout: any, sidebarConfig: any) {
  if (!appLayout) return;

  const styleEl = appLayout.querySelector('#customSidebarStyle');
  if (!styleEl) return;

  const width = document.body.clientWidth;
  styleEl.textContent = createCSS(sidebarConfig, width);

  const root = getRoot();
  if (!root || !root.shadowRoot) {
    log2console('updateStyling', 'Root/shadowRoot non pronto, skip header/footer');
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
    sidebarConfig.hideTopMenu === true &&
    sidebarConfig.showTopMenuOnMobile === true &&
    widthPx <= sidebarConfig.breakpoints.mobile &&
    offParam == null
  ) {
    if (hassHeader) hassHeader.style.display = 'block';
    if (view) view.style.minHeight = 'calc(100vh - ' + headerHeightPx + ')';
    if (hassFooter) hassFooter.style.display = 'flex';
  } else if (sidebarConfig.hideTopMenu === true && offParam == null) {
    if (hassHeader) hassHeader.style.display = 'none';
    if (hassFooter) hassFooter.style.display = 'none';
    if (view) view.style.minHeight = 'calc(100vh)';
  }
}

export function subscribeEvents(appLayout: any, sidebarConfig: any, contentContainer: any, sidebar: any) {
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

// IMPORTANT: in split version, we pass the builder callback.
export function watchLocationChange(buildFn: () => void) {
  setTimeout(() => {
    window.addEventListener('location-changed', () => {
      const root = getRoot();
      if (!root || !root.shadowRoot) return;

      const appLayout = root.shadowRoot.querySelector('div');
      if (!appLayout) return;

      const customSidebarWrapper = appLayout.querySelector('#customSidebarWrapper') as HTMLElement | null;
      if (!customSidebarWrapper) {
        buildFn();
      } else {
        const customSidebar = customSidebarWrapper.querySelector('#customSidebar') as HTMLElement | null;
        const customHeader = customSidebarWrapper.querySelector('#customHeaderContainer') as HTMLElement | null;
        if (!customSidebar && !customHeader) {
          buildFn();
        }
      }
    });
  }, 1000);
}

const LitElement = customElements.get('home-assistant-main')
  ? Object.getPrototypeOf(customElements.get('home-assistant-main'))
  : Object.getPrototypeOf(customElements.get('hui-view'));

const html = LitElement.prototype.html;

const css = LitElement.prototype.css;

function hass() {
  if(document.querySelector('hc-main'))
    return document.querySelector('hc-main').hass;

  if(document.querySelector('home-assistant'))
    return document.querySelector('home-assistant').hass;

  return undefined;
}
function lovelace_view() {
  var root = document.querySelector("hc-main");
  if(root) {
    root = root && root.shadowRoot;
    root = root && root.querySelector("hc-lovelace");
    root = root && root.shadowRoot;
    root = root && root.querySelector("hui-view");
    return root;
  }

  root = document.querySelector("home-assistant");
  root = root && root.shadowRoot;
  root = root && root.querySelector("home-assistant-main");
  root = root && root.shadowRoot;
  root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
  root = root && root.shadowRoot || root;
  root = root && root.querySelector("ha-panel-lovelace");
  root = root && root.shadowRoot;
  root = root && root.querySelector("hui-root");
  root = root && root.shadowRoot;
  root = root && root.querySelector("ha-app-layout #view");
  root = root && root.firstElementChild;
  return root;
}

function fireEvent(ev, detail, entity=null) {
  ev = new Event(ev, {
    bubbles: true,
    cancelable: false,
    composed: true,
  });
  ev.detail = detail || {};
  if(entity) {
    entity.dispatchEvent(ev);
  } else {
    var root = lovelace_view();
    if (root) root.dispatchEvent(ev);
  }
}

function moreInfo(entity, large=false) {
  const root = document.querySelector("hc-main") || document.querySelector("home-assistant");
  fireEvent("hass-more-info", {entityId: entity}, root);
  const el = root._moreInfoEl;
  el.large = large;
  return el;
}

const CUSTOM_TYPE_PREFIX = "custom:";

let helpers = window.cardHelpers;
const helperPromise = new Promise(async (resolve, reject) => {
  if(helpers) resolve();
  if(window.loadCardHelpers) {
    helpers = await window.loadCardHelpers();
    window.cardHelpers = helpers;
    resolve();
  }
});

function errorElement(error, origConfig) {
  const el = document.createElement("hui-error-card");
  el.setConfig({
    type: "error",
    error,
    origConfig,
  });
  return el;
}

function _createElement(tag, config) {
  let el = document.createElement(tag);
  try {
    el.setConfig(JSON.parse(JSON.stringify(config)));
  } catch (err) {
    el = errorElement(err, config);
  }
  helperPromise.then(() => {
    fireEvent("ll-rebuild", {}, el);
  });
  return el;
}

function createLovelaceElement(thing, config) {
  if(!config || typeof config !== "object" || !config.type)
    return errorElement(`No ${thing} type configured`, config);

  let tag = config.type;
  if(tag.startsWith(CUSTOM_TYPE_PREFIX))
    tag = tag.substr(CUSTOM_TYPE_PREFIX.length);
  else
    tag = `hui-${tag}-${thing}`;

  if(customElements.get(tag))
    return _createElement(tag, config);

  const el = errorElement(`Custom element doesn't exist: ${tag}.`, config);
  el.style.display = "None";

  const timer = setTimeout(() => {
    el.style.display = "";
  }, 2000);

  customElements.whenDefined(tag).then(() => {
    clearTimeout(timer);
    fireEvent("ll-rebuild", {}, el);
  });

  return el;
}

function createCard(config) {
  if(helpers) return helpers.createCardElement(config);
  return createLovelaceElement('card', config);
}

function _deviceID() {
  const ID_STORAGE_KEY = 'lovelace-player-device-id';
  if(window['fully'] && typeof fully.getDeviceId === "function")
    return fully.getDeviceId();
  if(!localStorage[ID_STORAGE_KEY])
  {
    const s4 = () => {
      return Math.floor((1+Math.random())*100000).toString(16).substring(1);
    };
    localStorage[ID_STORAGE_KEY] = `${s4()}${s4()}-${s4()}${s4()}`;
  }
  return localStorage[ID_STORAGE_KEY];
}
let deviceID = _deviceID();

function subscribeRenderTemplate(conn, onChange, params) {
  // params = {template, entity_ids, variables}
  if(!conn)
    conn = hass().connection;
  let variables = {
    user: hass().user.name,
    browser: deviceID,
    hash: location.hash.substr(1) || ' ',
    ...params.variables,
  };
  let template = params.template;
  let entity_ids = params.entity_ids;

  return conn.subscribeMessage(
    (msg) => {
      let res = msg.result;
      // Localize "_(key)" if found in template results
      const localize_function = /_\([^)]*\)/g;
      res = res.replace(localize_function, (key) => hass().localize(key.substring(2, key.length-1)) || key);
      onChange(res);
    },
    { type: "render_template",
      template,
      variables,
      entity_ids,
    }
  );
}

/**
 * Parse or format dates
 * @class fecha
 */
var fecha = {};
var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
var twoDigits = '\\d\\d?';
var threeDigits = '\\d{3}';
var fourDigits = '\\d{4}';
var word = '[^\\s]+';
var literal = /\[([^]*?)\]/gm;
var noop = function () {
};

function regexEscape(str) {
  return str.replace( /[|\\{()[^$+*?.-]/g, '\\$&');
}

function shorten(arr, sLen) {
  var newArr = [];
  for (var i = 0, len = arr.length; i < len; i++) {
    newArr.push(arr[i].substr(0, sLen));
  }
  return newArr;
}

function monthUpdate(arrName) {
  return function (d, v, i18n) {
    var index = i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());
    if (~index) {
      d.month = index;
    }
  };
}

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var monthNamesShort = shorten(monthNames, 3);
var dayNamesShort = shorten(dayNames, 3);
fecha.i18n = {
  dayNamesShort: dayNamesShort,
  dayNames: dayNames,
  monthNamesShort: monthNamesShort,
  monthNames: monthNames,
  amPm: ['am', 'pm'],
  DoFn: function DoFn(D) {
    return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
  }
};

var formatFlags = {
  D: function(dateObj) {
    return dateObj.getDate();
  },
  DD: function(dateObj) {
    return pad(dateObj.getDate());
  },
  Do: function(dateObj, i18n) {
    return i18n.DoFn(dateObj.getDate());
  },
  d: function(dateObj) {
    return dateObj.getDay();
  },
  dd: function(dateObj) {
    return pad(dateObj.getDay());
  },
  ddd: function(dateObj, i18n) {
    return i18n.dayNamesShort[dateObj.getDay()];
  },
  dddd: function(dateObj, i18n) {
    return i18n.dayNames[dateObj.getDay()];
  },
  M: function(dateObj) {
    return dateObj.getMonth() + 1;
  },
  MM: function(dateObj) {
    return pad(dateObj.getMonth() + 1);
  },
  MMM: function(dateObj, i18n) {
    return i18n.monthNamesShort[dateObj.getMonth()];
  },
  MMMM: function(dateObj, i18n) {
    return i18n.monthNames[dateObj.getMonth()];
  },
  YY: function(dateObj) {
    return pad(String(dateObj.getFullYear()), 4).substr(2);
  },
  YYYY: function(dateObj) {
    return pad(dateObj.getFullYear(), 4);
  },
  h: function(dateObj) {
    return dateObj.getHours() % 12 || 12;
  },
  hh: function(dateObj) {
    return pad(dateObj.getHours() % 12 || 12);
  },
  H: function(dateObj) {
    return dateObj.getHours();
  },
  HH: function(dateObj) {
    return pad(dateObj.getHours());
  },
  m: function(dateObj) {
    return dateObj.getMinutes();
  },
  mm: function(dateObj) {
    return pad(dateObj.getMinutes());
  },
  s: function(dateObj) {
    return dateObj.getSeconds();
  },
  ss: function(dateObj) {
    return pad(dateObj.getSeconds());
  },
  S: function(dateObj) {
    return Math.round(dateObj.getMilliseconds() / 100);
  },
  SS: function(dateObj) {
    return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
  },
  SSS: function(dateObj) {
    return pad(dateObj.getMilliseconds(), 3);
  },
  a: function(dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
  },
  A: function(dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
  },
  ZZ: function(dateObj) {
    var o = dateObj.getTimezoneOffset();
    return (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
  }
};

var parseFlags = {
  D: [twoDigits, function (d, v) {
    d.day = v;
  }],
  Do: [twoDigits + word, function (d, v) {
    d.day = parseInt(v, 10);
  }],
  M: [twoDigits, function (d, v) {
    d.month = v - 1;
  }],
  YY: [twoDigits, function (d, v) {
    var da = new Date(), cent = +('' + da.getFullYear()).substr(0, 2);
    d.year = '' + (v > 68 ? cent - 1 : cent) + v;
  }],
  h: [twoDigits, function (d, v) {
    d.hour = v;
  }],
  m: [twoDigits, function (d, v) {
    d.minute = v;
  }],
  s: [twoDigits, function (d, v) {
    d.second = v;
  }],
  YYYY: [fourDigits, function (d, v) {
    d.year = v;
  }],
  S: ['\\d', function (d, v) {
    d.millisecond = v * 100;
  }],
  SS: ['\\d{2}', function (d, v) {
    d.millisecond = v * 10;
  }],
  SSS: [threeDigits, function (d, v) {
    d.millisecond = v;
  }],
  d: [twoDigits, noop],
  ddd: [word, noop],
  MMM: [word, monthUpdate('monthNamesShort')],
  MMMM: [word, monthUpdate('monthNames')],
  a: [word, function (d, v, i18n) {
    var val = v.toLowerCase();
    if (val === i18n.amPm[0]) {
      d.isPm = false;
    } else if (val === i18n.amPm[1]) {
      d.isPm = true;
    }
  }],
  ZZ: ['[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z', function (d, v) {
    var parts = (v + '').match(/([+-]|\d\d)/gi), minutes;

    if (parts) {
      minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
      d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
    }
  }]
};
parseFlags.dd = parseFlags.d;
parseFlags.dddd = parseFlags.ddd;
parseFlags.DD = parseFlags.D;
parseFlags.mm = parseFlags.m;
parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
parseFlags.MM = parseFlags.M;
parseFlags.ss = parseFlags.s;
parseFlags.A = parseFlags.a;


// Some common format strings
fecha.masks = {
  default: 'ddd MMM DD YYYY HH:mm:ss',
  shortDate: 'M/D/YY',
  mediumDate: 'MMM D, YYYY',
  longDate: 'MMMM D, YYYY',
  fullDate: 'dddd, MMMM D, YYYY',
  shortTime: 'HH:mm',
  mediumTime: 'HH:mm:ss',
  longTime: 'HH:mm:ss.SSS'
};

/***
 * Format a date
 * @method format
 * @param {Date|number} dateObj
 * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
 */
fecha.format = function (dateObj, mask, i18nSettings) {
  var i18n = i18nSettings || fecha.i18n;

  if (typeof dateObj === 'number') {
    dateObj = new Date(dateObj);
  }

  if (Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime())) {
    throw new Error('Invalid Date in fecha.format');
  }

  mask = fecha.masks[mask] || mask || fecha.masks['default'];

  var literals = [];

  // Make literals inactive by replacing them with ??
  mask = mask.replace(literal, function($0, $1) {
    literals.push($1);
    return '@@@';
  });
  // Apply formatting rules
  mask = mask.replace(token, function ($0) {
    return $0 in formatFlags ? formatFlags[$0](dateObj, i18n) : $0.slice(1, $0.length - 1);
  });
  // Inline literal values back into the formatted value
  return mask.replace(/@@@/g, function() {
    return literals.shift();
  });
};

/**
 * Parse a date string into an object, changes - into /
 * @method parse
 * @param {string} dateStr Date string
 * @param {string} format Date parse format
 * @returns {Date|boolean}
 */
fecha.parse = function (dateStr, format, i18nSettings) {
  var i18n = i18nSettings || fecha.i18n;

  if (typeof format !== 'string') {
    throw new Error('Invalid format in fecha.parse');
  }

  format = fecha.masks[format] || format;

  // Avoid regular expression denial of service, fail early for really long strings
  // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
  if (dateStr.length > 1000) {
    return null;
  }

  var dateInfo = {};
  var parseInfo = [];
  var literals = [];
  format = format.replace(literal, function($0, $1) {
    literals.push($1);
    return '@@@';
  });
  var newFormat = regexEscape(format).replace(token, function ($0) {
    if (parseFlags[$0]) {
      var info = parseFlags[$0];
      parseInfo.push(info[1]);
      return '(' + info[0] + ')';
    }

    return $0;
  });
  newFormat = newFormat.replace(/@@@/g, function() {
    return literals.shift();
  });
  var matches = dateStr.match(new RegExp(newFormat, 'i'));
  if (!matches) {
    return null;
  }

  for (var i = 1; i < matches.length; i++) {
    parseInfo[i - 1](dateInfo, matches[i], i18n);
  }

  var today = new Date();
  if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
    dateInfo.hour = +dateInfo.hour + 12;
  } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
    dateInfo.hour = 0;
  }

  var date;
  if (dateInfo.timezoneOffset != null) {
    dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
    date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
      dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
  } else {
    date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1,
      dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
  }
  return date;
};

var a=function(){try{(new Date).toLocaleDateString("i");}catch(e){return "RangeError"===e.name}return !1}()?function(e,t){return e.toLocaleDateString(t,{year:"numeric",month:"long",day:"numeric"})}:function(t){return fecha.format(t,"mediumDate")},n=function(){try{(new Date).toLocaleString("i");}catch(e){return "RangeError"===e.name}return !1}()?function(e,t){return e.toLocaleString(t,{year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"})}:function(t){return fecha.format(t,"haDateTime")},r=function(){try{(new Date).toLocaleTimeString("i");}catch(e){return "RangeError"===e.name}return !1}()?function(e,t){return e.toLocaleTimeString(t,{hour:"numeric",minute:"2-digit"})}:function(t){return fecha.format(t,"shortTime")};function d(e){return e.substr(0,e.indexOf("."))}var R=["closed","locked","off"],A=function(e,t,a,n){n=n||{},a=null==a?{}:a;var r=new Event(t,{bubbles:void 0===n.bubbles||n.bubbles,cancelable:Boolean(n.cancelable),composed:void 0===n.composed||n.composed});return r.detail=a,e.dispatchEvent(r),r};var F=function(){var e=document.querySelector("home-assistant");if(e=(e=(e=(e=(e=(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root")){var t=e.lovelace;return t.current_view=e.___curView,t}return null},B=function(){var e=document.querySelector("home-assistant");if(e=(e=(e=(e=(e=(e=(e=(e=e&&e.shadowRoot)&&e.querySelector("home-assistant-main"))&&e.shadowRoot)&&e.querySelector("app-drawer-layout partial-panel-resolver"))&&e.shadowRoot||e)&&e.querySelector("ha-panel-lovelace"))&&e.shadowRoot)&&e.querySelector("hui-root"))return e.shadowRoot},U=function(e){A(window,"haptic",e);},V=function(e,t,a){void 0===a&&(a=!1),a?history.replaceState(null,"",t):history.pushState(null,"",t),A(window,"location-changed",{replace:a});},W=function(e,t,a){void 0===a&&(a=!0);var n,r=d(t),i="group"===r?"homeassistant":r;switch(r){case"lock":n=a?"unlock":"lock";break;case"cover":n=a?"open_cover":"close_cover";break;default:n=a?"turn_on":"turn_off";}return e.callService(i,n,{entity_id:t})},Y=function(e,t){var a=R.includes(e.states[t].state);return W(e,t,a)};//# sourceMappingURL=index.m.js.map

class SidebarCard extends LitElement {
    constructor() {
        super();
        this.templateLines = [];
    }
    static get properties() {
        return {
            hass: {},
            config: {},
            active: {}
        };
    }
    render() {
        const sidebarMenu = this.config.sidebarMenu;
        const sidebarMenuColor = this.config.sidebarMenuColor;
        const title = "title" in this.config ? this.config.title : false;
        const clock = this.config.clock && this.hass.states['sensor.time'] ? this.config.clock : false;
        const textColor = "textColor" in this.config ? this.config.textColor : false;
        return html `
      ${clock ? html `<h1 style="${textColor ? 'color:' + textColor : ''}">${this.hass.states['sensor.time'].state}</h1>` : html ``}
      ${title ? html `<h1 style="${textColor ? 'color:' + textColor : ''}">${title}</h1>` : html ``}
      
      ${this.config.template ? html `
        <ul class="template" style="${textColor ? 'color:' + textColor : ''}">
          ${this.templateLines.map(line => {
            return html `<li>${line}</li>`;
        })}
        </ul>
      ` : html ``}
      ${sidebarMenu.length > 0 ? html `
      <ul class="sidebarMenu" style="${sidebarMenuColor ? 'color:' + sidebarMenuColor : ''}">
        ${sidebarMenu.map(sidebarMenuItem => {
            return html `<li @click="${e => this._menuAction(e)}" data-path="${sidebarMenuItem.navigation_path ? sidebarMenuItem.navigation_path : ''}" data-menuitem="${JSON.stringify(sidebarMenuItem)}" data->${sidebarMenuItem.name}</li>`;
        })}
      </ul>
      ` : html ``}
    `;
    }
    firstUpdated() {
        document.querySelectorAll("paper-tab").forEach(paperTab => {
            paperTab.addEventListener('click', () => {
                this._updateActiveMenu();
            });
        });
    }
    updated() { }
    _updateActiveMenu() {
        console.log(document.location.pathname);
        this.shadowRoot.querySelectorAll.forEach(menuItem => {
            menuItem.classList.remove("active");
        });
        this.shadowRoot.querySelector('li[data-path="' + document.location.pathname + '"]').classList.add('active');
    }
    _menuAction(e) {
        if (e.target.dataset && e.target.dataset.menuitem) {
            const menuItem = JSON.parse(e.target.dataset.menuitem);
            this._customAction(menuItem);
        }
    }
    _customAction(tapAction) {
        switch (tapAction.action) {
            case "more-info":
                if (tapAction.entity || tapAction.camera_image) {
                    moreInfo(tapAction.entity ? tapAction.entity : tapAction.camera_image);
                }
                break;
            case "navigate":
                if (tapAction.navigation_path) {
                    V(window, tapAction.navigation_path);
                }
                break;
            case "url":
                if (tapAction.url_path) {
                    window.open(tapAction.url_path);
                }
                break;
            case "toggle":
                if (tapAction.entity) {
                    Y(this.hass, tapAction.entity);
                    U("success");
                }
                break;
            case "call-service": {
                if (!tapAction.service) {
                    U("failure");
                    return;
                }
                const [domain, service] = tapAction.service.split(".", 2);
                this.hass.callService(domain, service, tapAction.service_data);
                U("success");
            }
        }
    }
    setConfig(config) {
        if (!config.sidebarMenu) {
            throw new Error("You need to define sidebarMenu");
        }
        this.config = config;
        if (this.config.template) {
            subscribeRenderTemplate(null, (res) => {
                var result = res.match(/<li>(.*?)<\/li>/gs).map(function (val) {
                    return val.replace(/<\/?li>/g, '');
                });
                this.templateLines = result;
            }, {
                template: this.config.template,
                variables: { config: this.config },
                entity_ids: this.config.entity_ids,
            });
        }
    }
    getCardSize() {
        return 1;
    }
    static get styles() {
        return css `
        :host {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .sidebarMenu {
          list-style:none;
          margin:0 0 30px 4px;
          padding: 0 16px 0 0;
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
          margin-bottom: 30px;
          margin-left: 4px;
          font-size: 32px;
          font-weight: 300;
        }
        .template {
          margin:0 0 30px 4px;
          padding: 0 16px 0 0;
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
async function buildCard(sidebar, config) {
    config.type = 'custom:sidebar-card';
    const sidebarCard = createCard(config);
    sidebarCard.hass = hass();
    sidebar.appendChild(sidebarCard);
    return new Promise((resolve) => sidebarCard.updateComplete ? sidebarCard.updateComplete.then(() => resolve(sidebarCard)) : resolve(sidebarCard));
}
async function buildSidebar() {
    let lovelace = F();
    if (lovelace.config.sidebar) {
        let root = B();
        let appLayout = root.querySelector('ha-app-layout');
        // get element to wrap
        let contentContainer = appLayout.shadowRoot.querySelector('#contentContainer');
        // create wrapper container
        var wrapper = document.createElement('div');
        wrapper.setAttribute('id', 'customSidebarWrapper');
        wrapper.setAttribute('style', 'display:flex;flex-direction:row');
        // insert wrapper before el in the DOM tree
        contentContainer.parentNode.insertBefore(wrapper, contentContainer);
        // move el into wrapper
        let sidebar = document.createElement('div');
        sidebar.setAttribute('id', 'customSidebar');
        sidebar.setAttribute('style', 'width:25%;');
        wrapper.appendChild(sidebar);
        wrapper.appendChild(contentContainer);
        contentContainer.setAttribute('style', 'width:75%;');
        await buildCard(sidebar, lovelace.config.sidebar);
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

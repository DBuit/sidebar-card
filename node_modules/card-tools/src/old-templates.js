import {hass} from './hass.js';
import {deviceID} from './deviceID.js';

export function hasOldTemplate(text) {
  return /\[\[\s+.*\s+\]\]/.test(text);
}

function parseTemplateString(str, specialData = {}) {
  if(typeof(str) !== "string") return text;
  const FUNCTION = /^[a-zA-Z0-9_]+\(.*\)$/;
  const EXPR = /([^=<>!]+)\s*(==|!=|<|>|<=|>=)\s*([^=<>!]+)/;
  const SPECIAL = /^\{.+\}$/;
  const STRING = /^"[^"]*"|'[^']*'$/;

  if(typeof(specialData) === "string") specialData = {};
  specialData = Object.assign({
    user: hass().user.name,
    browser: deviceID,
    hash: location.hash.substr(1) || ' ',
  }, specialData);

  const _parse_function = (str) => {
    let args = [str.substr(0, str.indexOf('(')).trim()]
    str = str.substr(str.indexOf('(')+1);
    while(str) {
      let index = 0;
      let parens = 0;
      let quote = false;
      while(str[index]) {
        let c = str[index++];

        if(c === quote && index > 1 && str[index-2] !== "\\")
            quote = false;
        else if(`"'`.includes(c))
          quote = c;
        if(quote) continue;

        if(c === '(')
          parens = parens + 1;
        else if(c === ')') {
          parens = parens - 1;
          continue
        }
        if(parens > 0) continue;

        if(",)".includes(c)) break;
      }
      args.push(str.substr(0, index-1).trim());
      str = str.substr(index);
    }
    return args;
  };

  const _parse_special = (str) => {
    str = str.substr(1, str.length - 2);
    return specialData[str] || `{${str}}`;
  };

  const _parse_entity = (str) => {
    str = str.split(".");
    let v;
    if(str[0].match(SPECIAL)) {
      v = _parse_special(str.shift());
      v = hass().states[v] || v;
    } else {
      v = hass().states[`${str.shift()}.${str.shift()}`];
      if(!str.length) return v['state'];
    }
    str.forEach(item => v=v[item]);
    return v;
  }

  const _eval_expr = (str) => {
    str = EXPR.exec(str);
    if(str === null) return false;
    const lhs = parseTemplateString(str[1]);
    const rhs = parseTemplateString(str[3]);
    var expr = ''
    if(parseFloat(lhs) != lhs)
      expr = `"${lhs}" ${str[2]} "${rhs}"`;
    else
      expr = `${parseFloat(lhs)} ${str[2]} ${parseFloat(rhs)}`
    return eval(expr);
  }

  const _eval_function = (args) => {
    if(args[0] === "if") {
      if(_eval_expr(args[1]))
        return parseTemplateString(args[2]);
      return parseTemplateString(args[3]);
    }
  }

  try {
    str = str.trim();
    if(str.match(STRING))
      return str.substr(1, str.length - 2);
    if(str.match(SPECIAL))
      return _parse_special(str);
    if(str.match(FUNCTION))
      return _eval_function(_parse_function(str));
    if(str.includes("."))
      return _parse_entity(str);
    return str;
  } catch (err) {
    return `[[ Template matching failed: ${str} ]]`;
  }
}

export function parseOldTemplate(text, data = {}) {
  if(typeof(text) !== "string") return text;
  // Note: .*? is javascript regex syntax for NON-greedy matching
  var RE_template = /\[\[\s(.*?)\s\]\]/g;
  text = text.replace(RE_template, (str, p1, offset, s) => parseTemplateString(p1, data));
  return text;
}

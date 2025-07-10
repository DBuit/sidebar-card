export const LitElement = customElements.get('home-assistant-main')
  ? Object.getPrototypeOf(customElements.get('home-assistant-main'))
  : Object.getPrototypeOf(customElements.get('hui-view'));

export const html = LitElement.prototype.html;

export const css = LitElement.prototype.css;

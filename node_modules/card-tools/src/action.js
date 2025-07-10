export function bindActionHandler(element, options={}) {
  customElements.whenDefined("long-press").then(() => {
    const longpress = document.body.querySelector("long-press");
    longpress.bind(element);
  });
  customElements.whenDefined("action-handler").then(() => {
    const actionHandler = document.body.querySelector("action-handler");
    actionHandler.bind(element, options);
  });
  return element;
}

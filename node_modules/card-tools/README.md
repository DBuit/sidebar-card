card-tools version 2
====================

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

This is a collection of tools to simplify creating custom cards for [Home Assistant](https://home-assistant.io)

## Installation instructions

If you see "Can't find card-tools. [...]" in your Home Assistant UI, follow these instructions.

To install `card-tools` follow [this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

The recommended type of this plugin is: `module`

```yaml
resources:
  url: /local/card-tools.js
  type: module
```

## User instructions

That's all. You don't need to do anything else.

---
---
---

## Card Developer Instructions

There are two ways you can get access to the card-tools functions.

1. If you are using npm and a packager:

  Add the package as a dependency

```bash
> npm install thomasloven/lovelace-card-tools
```

  And then import the parts you want

```javascript
import { LitElement } from "card-tools/src/lit-element";
```

2. Have your users add `card-tools.js` to their lovelace resources and access the functions through the `card-tools` customElement:

```javascript
customElements.whenDefined('card-tools').then(() => {
  var cardTools = customElements.get('card-tools');
  // YOUR CODE GOES IN HERE

  class MyPlugin extends cardTools.LitElement {
    setConfig(config) {
      this.name = config.name;
    }

    render() {
      return cardTools.LitHtml`
        ${this.name}
      `;
    }
  }

  customElements.define("my-plugin", MyPlugin);
}); // END OF .then(() => {

setTimeout(() => {
  if(customElements.get('card-tools')) return;
  customElements.define('my-plugin', class extends HTMLElement{
    setConfig() { throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools");}
  });
}, 2000);
```

The `setTimeout` block at the end will make your element display an error message if `card-tools` is not found. Make sure the element name is the same in both `customElements.define()` calls.


## Functions

### `card-tools/src/deviceID`
#### `deviceID`
This can be used to uniquely identify the device connected to Lovelace. Or actually, the device-browser combination.

It generates a random number, and stores it in the browsers local storage. That means it will stay around for quite a while.

It's kind of hard to explain, but as an example I use this to identify the browser for [browser_mod](https://github.com/thomasloven/hass-browser_mod).

I'm sure this can have lots of more uses.

The device ID is stored in localstorage with a key called `lovelace-player-device-id` (for historical reasons).


### `card-tools/src/event`
#### `fireEvent(ev, detail)` / `cardTools.fireEvent(...)
This is mainly used as a helper for some other functions of `cardTools`, but it could be useful to fire a lovelace event sometime, such as `"config-refresh"` perhaps? Explore!


### `card-tools/src/hass`
#### `hass()` / `cardTools.hass`
This is provided for plugins that *aren't* cards, elements or entity rows. For those three kinds, the hass object is kindly provided to you by the whatever loads your element, but if you wish to write something that doesn't have a representation in the DOM, this can give you access to all of Home Assistants power anyway.

```js
  ...
  greeting.innerHTML = `Hi there, ${cardTools.hass.user.name}`;
  cardTools.hass.connection.subscribeEvents((event) => {console.log("A service was called in Home Assistant")}, 'call-service');
```
**Note that this is called as a function if imported, but is a direct property of the cardTools element.**

### `lovelace()` / `cardTools.lovelace`
This object contains information about the users lovelace configuration. As a bonus `lovelace().current_view` contains the index of the currently displayed view.  
**Note that this is called as a function if imported, but is a direct property of the cardTools element.**

### `lovelace_view()` / `cardTools.lovelace_view()`
Return a reference to the lovelace view object.

### `provideHass(element)` / `cardTools.provideHass(...)`
Will make sure `element.hass` is set and updated whenever the `hass` object is updated (i.e. when any entity state changes).

### `load_lovelace()`
Evaluating this function will load in the lovelace interface and all customElements of it, such as `ha-card`.
This is not provided in the `card-tools` element, because that wouldn't make sense.


### `card-tools/src/lit-element`
#### `LitElement` / `cardTools.LitElement`
The [lit-element](https://lit-element.polymer-project.org/) base class. Using this could save you a few bytes.

#### `html` / `cardTools.LitHtml`
#### `css` / `cardTools.LitCSS`
The `html` and `css` functions from lit-element.

### `card-tools/src/action`
#### `bindActionHandler(element, options)` / `cardTools.longpress(...)
This binds `element` to the action-handler of lovelace, which manages different special click/tap actions such as long-press or double click.

Once bound, the element will receive `action` events whenever something happens.

```javascript
render() {
  return html`
    <div
      id="my-clickable-div"
      @action=${(ev) => console.log("I was clicked, or something", ev)

    >
      Double-tap me!
    </div>`;
}

firstUpdated() {
  bindActionHandler(this.shadowRoot.querySelector("#my-clickable-div"), {hasHold: true, hasDoubleClick: true});
}
```

### `card-tools/src/lovelace-element.js`
#### `createCard(config)` / `cardTools.createCard(...)`
#### `createElement(config)` / `cardTools.createElement(...)`
#### `createEntityRow(config)` / `cardTools.createEntityRow(...)`

Currently, custom elements can be used in three places in Lovelace; as cards, as elements in a `picture-elements` card or as rows in an `entities` card.

Those functions creates a card, element or row safely and cleanly from a config object. They handle custom elements and automatically picks the most suitable row for an entity. In short, it's mainly based on - and works very similar to - how Lovelace handles those things natively.

```javascript
const myElement = createElement({
  type: "state-icon",
  entity: "light.bed_light",
  hold_action: {action: "toggle"},
});
```

### `card-tools/src/card-maker`
Importing this file (or adding `card-tools.js` the lovelace resources) will define three new customElements, `card-maker`, `element-maker` and `entity-row-maker` which acts as wrappers for cards, elements and entity rows respectively. Very useful for e.g. cards which contain other cards:

```javascript
render() {
  return html`
  <ha-card>
    <card-maker
      .config=${this.card1_config}
      .hass=${this.hass}
      ></card-maker>
    <card-maker
      .config=${this.card2_config}
      .hass=${this.hass}
      ></card-maker>
  </ha-card>`;
}
```

### `card-tools/src/more-info`
#### `moreInfo(entity, large=false)` / `cardTools.moreInfo(...)`
Pops open the more-info dialog for `entity`.

### `card-tools/src/popup`
#### `popUp(title, card, large=false, style=null, fullscreen=false)` / `cardTools.popUp(...)`
Opens up a dialog similar to the more-info dialog, but with the contents replaces by the lovelace card defined by `card`.

#### `closePopUp()` / `cardTools.closePopUp()`
Closes a popUp or more-info dialog.

### `card-tools/src/templates`
#### `parseTemplate(hass, str, variables)` / `cardTools.parseTemplate(hass, str, variables)`
Renders and returns a jinja2 template in the backend.
Only works if the currently logged in user is in the admin group.

#### `subscribeRenderTemplate(conn, onChange, params)` / `cardTools.subscribeRenderTemplate(...)`
Renders the jinja2 templates in `parameters.template` in the backend and sends the results to `onChange` whenever anything changes.
Returns a function for canceling the subscription.

### `card-tools/src/old-templates`
Relates to my [Mod Plugin Templates](https://github.com/thomasloven/hass-config/wiki/Mod-plugin-templates) which are rendered entirely in the frontend

#### `hasOldTemplate(text)`
Check if there is a template in `text`.

#### `parseOldTemplate(text, data)` / `cardTools.parseTemplate(text, data)`
Parses a template and returns the result.

---
<a href="https://www.buymeacoffee.com/uqD6KHCdJ" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

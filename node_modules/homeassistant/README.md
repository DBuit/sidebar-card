node-homeassistant
==================

[Home Assistant](https://home-assistant.io/) API Node.js library.
It wraps the [Home Assistant RESTful API](https://home-assistant.io/developers/rest_api/) in easy-to-use, Promise-based functions.

[![NPM Badge](https://nodei.co/npm/homeassistant.png?downloads=true&stars=true)](https://npmjs.org/package/homeassistant)

Install
=======
```bash
npm install homeassistant
```

Usage
=====
```javascript
const HomeAssistant = require('homeassistant');
const hass = new HomeAssistant({
  // Your Home Assistant host
  // Optional, defaults to http://locahost
  host: 'http://example.com',

  // Your Home Assistant port number
  // Optional, defaults to 8123
  port: 8123,

  // Your long lived access token generated on your profile page.
  // Optional
  token: '810a8c43-f22e-4ec4-b34e-c1e4741d4802',

  // Your Home Assistant Legacy API password
  // Optional
  // password: 'api_password',

  // Ignores SSL certificate errors, use with caution
  // Optional, defaults to false
  ignoreCert: false
});

hass.services.call('toggle', 'switch', 'lights_3_0')
  .then(res => console.log('Toggled lights', res))
  .catch(err => console.error(err));
```

Interface
=========
All functions return Promises.

Configuration
-------------
```javascript
// Returns if the API is up and running
hass.status();

// Returns the current configuration
hass.config();

// Returns basic information about the Home Assistant instance
hass.discoveryInfo();

// Returns all data needed to bootstrap Home Assistant
hass.bootstrap();
```

Camera
------
```javascript
// Returns the image from the specified camera entity
hass.camera.image('entityId');
```

Events
------
```javascript
// Returns an array of event objects
hass.events.list();

// Fires an event
// Requires the event name and an event data JSON object
hass.events.fire('call_service', {
  domain: 'switch',
  service: 'toggle',
  service_data: {
    entity_id: 'switch.lights_3_0'
  }
});
```

History
-------
```javascript
// Returns an array of state changes in the past
// Requires a datetime in YYYY-MM-DDTHH:MM:SSZ format
// An optional entityId can be provided to filter the results
hass.history.state('2017-05-01T12:00:00-04:00', 'sensor.temperature');
```

Logs
----
```javascript
// Returns all errors logged during the current session of Home Assistant
hass.logs.errors();
```

Services
--------
```javascript
// Returns an array of all service objects
hass.services.list();

// Calls a service
// Requires the service, the domain, and the entity
// Alternatively, you can provide a service data JSON object as the third parameter
hass.services.call('toggle', 'switch', 'lights_3_0');
hass.services.call('toggle', 'switch', {
  entity_id: 'switch.lights_3_0'
});
```

States
------
```javascript
// Returns an array of all state objects
hass.states.list();

// Returns a state object for a specified entity
// Requires the domain and entity
hass.states.get('sensor', 'temperature');

// Updates or creates the current state of an entity
// Requires the domain, entity, and a JSON object with a `state` attribute
hass.states.update('sensor', 'temperature', {
  state: 80,
  attributes: {
    unit_of_measurement: '°F'
  }
});
```

Templates
---------
```javascript
// Renders a Home Assistant template: https://home-assistant.io/topics/templating/
hass.templates.render('Mike is at {{ states("device_tracker.mike") }}.');
```

License
-------
MIT

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

# Sidebar card
This card adds a sidebar to your interface which you can configure globally so every page has the sidebar. It can replace your top navigation but can also give extra functionality.


<a href="https://www.buymeacoffee.com/ZrUK14i" target="_blank"><img height="41px" width="167px" src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee"></a>


## Installation instructions

**HACS installation:**
Go to the hacs store and use the repo url `https://github.com/DBuit/sidebar-card` and add this as a custom repository under settings.

Add the following to your ui-lovelace.yaml:
```yaml
resources:
  url: /community_plugin/sidebar-card/sidebar-card.js
  type: module
```

**Manual installation:**
Copy the .js file from the dist directory to your www directory and add the following to your ui-lovelace.yaml file:

```yaml
resources:
  url: /local/sidebar-card.js
  type: module
```

## Configuration

The YAML configuration happens at the root of your Lovelace config under sidebar: at the same level as resources: and views:. Example:

```
resources:
  - url: /local/sidebar-card.js?v=0.0.1
    type: module   
sidebar:
  title: "Sidebar title"
views:
....
```

### Main Options

Under sidebar you can configur the following options

| Name | Type | Default | Supported options | Description |
| -------------- | ----------- | ------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title` | string | optional | `Title` | Title to show in the sidebar |
| `clock` | boolean | optional | `true` | Show analog clock in sidebar |
| `digitalClock` | boolean | optional | `true` | Show digital clock in sidebar |
| `digitalClockWithSeconds` | boolean | optional | `true` | If digitalClock is enabled you can also enable to show seconds |
| `width` | object | optional | more info | The width of the sidebar in percentages for different screens |
| `hideTopMenu` | boolean | optional | `true` | Hide the top home assistant menu |
| `showTopMenuOnMobile` | boolean | optional | `true` | If you hide the top menu you can set this to `true` so that it will be shown on mobile |
| `breakpoints` | object | optional | more info | For the width we set different sizes for different screens with breakpoints you can overwrite these breakpoints |
| `sidebarMenu` | object | optional | more inf | Create a menu that can switch to different pages but also call any service you want |
| `template` | template | optional | more info | Template rules that will show messages to inform you for example with how many lights are on |


##### Width

```
sidebar:
  width:
    mobile: 0
    tablet: 25
    desktop: 20
```

##### Breakpoints

```
sidebar:
  breakpoints:
    mobile: 768
    tablet: 1024
```

##### sidebarMenu

```
sidebar:
  sidebarMenu:
    - action: navigate
      navigation_path: "/lovelace/home"
      name: "Home"
      icon: mdi:home
      active: true
    - action: navigate
      navigation_path: "/lovelace/lampen"
      name: "Lampen"
      icon: mdi:home
    - action: navigate
      navigation_path: "/lovelace/music"
      name: "Muziek"
      icon: mdi:home
    - action: navigate
      navigation_path: "/lovelace/4"
      name: "Test"
      icon: mdi:home
```

##### template

```
sidebar:
  template: |
    <li>
      {% if now().hour  < 5 %} Goede nacht {{'\U0001F634'}}
      {% elif now().hour < 12 %} Goedemorgen {{'\u2615\uFE0F'}}
      {% elif now().hour < 18 %} Goedenmiddag {{'\U0001F44B\U0001F3FB'}}
      {% else %} Goedenavond {{'\U0001F44B\U0001F3FB'}}{% endif %}
    </li>
    {% if "Vandaag" in states('sensor.blink_gft') %} <li>Vandaag groenebak aan de straat</li> {% endif %}
    {% if "Vandaag" in states('sensor.blink_papier') %} <li>Vandaag oudpapier aan de straat</li> {% endif %}
    {% if "Vandaag" in states('sensor.blink_pmd') %} <li>Vandaag plastic aan de straat</li> {% endif %}
    {% if "Vandaag" in states('sensor.blink_restafval') %} <li>Vandaag grijzebak aan de straat</li> {% endif %}
    {% if "Morgen" in states('sensor.blink_gft') %} <li>Morgen groenebak aan de straat</li> {% endif %}
    {% if "Morgen" in states('sensor.blink_papier') %} <li>Morgen oudpapier aan de straat</li> {% endif %}
    {% if "Morgen" in states('sensor.blink_pmd') %} <li>Morgen plastic aan de straat</li> {% endif %}
    {% if "Morgen" in states('sensor.blink_restafval') %} <li>Morgen grijzebak aan de straat</li> {% endif %}
    {% if states('sensor.current_lights_on') | float > 0 %} <li>{{states('sensor.current_lights_on')}} lampen aan</li> {% endif %}
    {% if states('sensor.current_media_players_on') | float > 0 %} <li>{{states('sensor.current_media_players_on')}} speakers aan</li> {% endif %}
```

### Screenshots

![Screenshot default](screenshot-default.png)
![Screenshot styled](screenshot-styled.png)

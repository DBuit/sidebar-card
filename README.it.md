[![Sample](https://storage.ko-fi.com/cdn/generated/zfskfgqnf/2025-03-07_rest-7d81acd901abf101cbdf54443c38f6f0-dlmmonph.jpg)](https://ko-fi.com/silviosmart)

## Supportami / Support Me

Se ti piace il mio lavoro e vuoi che continui nello sviluppo delle card, puoi offrirmi un caffè.\
If you like my work and want me to continue developing the cards, you can buy me a coffee.


[![PayPal](https://img.shields.io/badge/Donate-PayPal-%2300457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=Z6KY9V6BBZ4BN)

Non dimenticare di seguirmi sui social:\
Don't forget to follow me on social media:

[![TikTok](https://img.shields.io/badge/Follow_TikTok-%23000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@silviosmartalexa)

[![Instagram](https://img.shields.io/badge/Follow_Instagram-%23E1306C?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/silviosmartalexa)

[![YouTube](https://img.shields.io/badge/Subscribe_YouTube-%23FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@silviosmartalexa)

# 🧭 Sidebar & Header personalizzati per Home Assistant
[🇬🇧 English](README.md)

## 📸 Screenshot


<p align="center">
  <img src="img/1.PNG" width="48%">
  <img src="img/2.PNG" width="48%">
</p>

<p align="center">
  <img src="img/3.PNG" width="48%">
  <img src="img/4.PNG" width="48%">
</p>

<p align="center">
  <img src="img/5.PNG" width="48%">
  <img src="img/6.PNG" width="48%">
</p>

Sistema **completamente personalizzabile** di **Header + Sidebar** per Home Assistant, moderno, fluido e responsive — compatibile con qualsiasi dashboard Lovelace.

---

## ⭐ Funzionalità

- Sidebar responsive (mobile / tablet / desktop)
- Header fisso con effetto vetro
- **4 stili menu (list / wide / buttons / grid)**
- Voci condizionali
- Colori e icone per singola voce
- Possibilità di nascondere sidebar & top‑bar originali
- Template HTML per messaggi dinamici
- Supporto card personalizzate
- Compatibile con kiosk‑mode
- Sicuro: non modifica il core di Lovelace

---

# 📦 Installazione

## HACS

Puoi installare l'integrazione premendo direttamente sul tasto

[![Apri in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=bobsilvio&repository=sidebar-card&category=plugin)



---

# 🚀 Configurazione Base

```yaml
sidebar:
  enabled: true
  width: { mobile: 0, tablet: 16, desktop: 18 }

header:
  enabled: true
  sticky: true
  height: 72
```

---

# 🧭 Opzioni Sidebar

| Opzione | Tipo | Default | Descrizione |
|--------|------|---------|-------------|
| enabled | bool | true | abilita sidebar |
| debug | bool | false | log console |
| title | string | "" | titolo opzionale |
| clock | bool | false | orologio analogico |
| digitalClock | bool | false | orologio digitale |
| digitalClockWithSeconds | bool | false | mostra i secondi |
| twelveHourVersion | bool | false | formato 12 ore |
| period | bool | false | mostra AM/PM |
| date | bool | true | mostra data |
| dateFormat | string | DD MMMM | formato data |
| updateMenu | bool | true | evidenzia la voce attiva |
| hideHassSidebar | bool | false | nasconde la sidebar HA |
| hideTopMenu | bool | false | nasconde la barra alta |
| showTopMenuOnMobile | bool | true | mostra top‑bar solo su mobile |
| width | numero/oggetto | 18 | larghezza percentuale |
| breakpoints.mobile | int | 767 | max mobile |
| breakpoints.tablet | int | 1024 | max tablet |
| hideOnPath | lista | — | pagine dove nasconderla |
| menuStyle | string | list | `list / wide / buttons / grid` |
| showLabel | bool | true | mostra il testo |
| template | jinja | — | HTML dinamico |
| bottomCard | card | — | card in fondo |

---

# 📐 Larghezza Responsive

```yaml
width:
  mobile: 0
  tablet: 16
  desktop: 18
```

---

# 📋 Voci Menu Sidebar

```yaml
sidebarMenu:
  - action: navigate
    navigation_path: "/home"
    name: "Home"
    icon: mdi:home
    background_color: "var(--blue)"
    icon_color: "#000"
    text_color: "#000"
```

Azioni supportate: `navigate`, `toggle`, `url`, `more-info`, `call-service`, `service-js`

Campi aggiuntivi:

- `state:` entità per marcare la voce come attiva
- `conditional:` se falso → nasconde la voce

---

# 🎨 Stili Menu

| menuStyle | Descrizione |
|-----------|-------------|
| list | lista semplice |
| wide | **pill lunghe colorate con icona + testo** |
| buttons | bottoni quadrati |
| grid | griglia stile iPhone |

## Esempio stile wide

```yaml
sidebar:
  menuStyle: wide
  showLabel: true
```

```yaml
- action: navigate
  name: "Energia"
  icon: mdi:solar-power-variant
  navigation_path: "/energia"
  background_color: "rgba(255, 200, 140, 0.95)"
  icon_color: "#0f172a"
  text_color: "#0f172a"
```

---

# 🧱 Header

```yaml
header:
  enabled: true
  sticky: true
  height: 72
  headerMenuStyle: wide
  headerMenuShowLabel: true
  headerMenuPosition: center
```

---

# 🎨 Variabili CSS

(identiche a quelle elencate nella versione inglese)

---

# 🛠 Problemi comuni

- svuota la cache browser
- disattiva plugin di layout in conflitto
- prova senza tema grafico

---

# ❤️ Crediti

Creato per la community Home Assistant 🙂

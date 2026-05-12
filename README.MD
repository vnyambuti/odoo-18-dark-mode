# 🌙 Dark Mode — Odoo 18

> A full dark theme for the Odoo 18 backend interface, with a one-click systray toggle.

![Version](https://img.shields.io/badge/version-18.0.1.0.0-blue)
![Odoo](https://img.shields.io/badge/Odoo-18.0-purple)
![License](https://img.shields.io/badge/license-LGPL--3-green)

---

## Features

| | Feature | Description |
|---|---|---|
| 🌙 | **One-click toggle** | Moon/sun icon in the systray (top-right navbar) |
| 💾 | **Persistent preference** | Saved to `localStorage` — survives reloads and navigation |
| 🖥️ | **OS preference detection** | Matches your system dark/light mode on first visit |
| ⚡ | **Flash-free load** | Theme applied before OWL mounts — no white flash |
| 🔍 | **Dynamic DOM patching** | `MutationObserver` catches inline backgrounds injected by Odoo JS |
| 🎨 | **Full backend coverage** | List, Kanban, Form, Calendar, Pivot, Discuss, Apps, Settings, and more |
| 📦 | **Zero dependencies** | Only depends on the built-in `web` module |

---

## Module Structure

```
dark_mode/
├── __init__.py
├── __manifest__.py
└── static/
    └── src/
        ├── css/
        │   └── dark_mode.css    # ~1 000 lines of CSS variable overrides
        └── js/
            └── dark_mode.js     # OWL systray component + DOM observer
```

---

## Installation

### 1. Copy the module

Extract `dark_mode.zip` and place the `dark_mode/` folder inside your Odoo addons directory:

```bash
unzip dark_mode.zip -d /path/to/your/odoo/addons/
```

### 2. Restart Odoo

```bash
# systemd
sudo systemctl restart odoo

# or direct
python odoo-bin -c odoo.conf --stop-after-init
```

### 3. Update the Apps list

In the Odoo backend go to **Apps → Update Apps List** and confirm.

### 4. Install

Search for **Dark Mode** and click **Install**, then hard-refresh your browser:

- **Windows / Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

---

## Usage

After installation a 🌙 icon appears in the top-right systray.

- Click **🌙** to activate dark mode → icon becomes **☀️**
- Click **☀️** to return to light mode → icon becomes **🌙**
- Preference persists automatically across sessions

---

## Theme Coverage

| View | View | View |
|---|---|---|
| List | Kanban | Form |
| Calendar | Pivot / Graph | Gantt |
| Chatter | Discuss / DMs | Settings |
| Apps / Modules | Modals & Dialogs | Dropdowns & Menus |
| Control Panel | Search Bar | Breadcrumbs |
| Notifications | Activity View | Debug menu |

---

## Colour Palette

All colours are defined as CSS custom properties scoped under `html.o_dark_mode`.

| Variable | Value | Usage |
|---|---|---|
| `--dm-bg` | `#0f1117` | Page background |
| `--dm-bg-2` | `#181b24` | Cards, navbar, sidebars |
| `--dm-bg-3` | `#1e2130` | Tabs, form sheets, headers |
| `--dm-bg-4` | `#252a3a` | Input fields |
| `--dm-bg-hover` | `#2c3147` | Hover states |
| `--dm-border` | `#2e3349` | Borders, dividers |
| `--dm-border-light` | `#3a4060` | Subtle borders |
| `--dm-text` | `#d4d8e8` | Body text |
| `--dm-text-heading` | `#eef0f8` | Headings |
| `--dm-text-muted` | `#7b84a3` | Labels, placeholders, captions |
| `--dm-primary` | `#6c8ef5` | Buttons, links, accents |
| `--dm-primary-bg` | `#1e2a52` | Active/selected backgrounds |
| `--dm-success` | `#3ecf8e` | Success states |
| `--dm-danger` | `#f06b6b` | Error / delete states |
| `--dm-warning` | `#f5b942` | Warning states |

---

## Technical Notes

### CSS Architecture

All overrides are scoped under `html.o_dark_mode` to prevent bleed when dark mode is off. CSS custom properties define the palette once; all rules reference them, making customisation straightforward.

```css
html.o_dark_mode {
    --dm-bg:      #0f1117;
    --dm-primary: #6c8ef5;
    /* ... */
}
```

### MutationObserver

Odoo 18's OWL framework sometimes sets `style="background-color: #f5f5f5"` on elements after they mount. The JS observer uses `window.getComputedStyle()` to detect any element with a perceived luminance above a threshold and overrides it with the dark background — regardless of CSS class or selector.

```js
// Scans up to 2 000 nodes per subtree addition
const _observer = new MutationObserver((mutations) => { ... });
_observer.observe(document.body, {
    subtree: true, childList: true,
    attributes: true, attributeFilter: ["style", "class"],
});
```

### Asset Registration

Both files are registered in `web.assets_backend` via the manifest and bundled by Odoo's asset pipeline:

```python
'assets': {
    'web.assets_backend': [
        'dark_mode/static/src/css/dark_mode.css',
        'dark_mode/static/src/js/dark_mode.js',
    ],
},
```

---

## Customisation

To adjust the colour scheme, edit the CSS variables at the top of `dark_mode.css`:

```css
html.o_dark_mode {
    --dm-bg:      #0f1117;   /* change to your preferred base */
    --dm-primary: #6c8ef5;   /* accent / button colour */
}
```

All other rules reference these variables, so changing the palette here propagates everywhere automatically.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Toggle button not visible | Hard-refresh (`Ctrl+Shift+R`). Check browser console for JS errors and verify the module is installed. |
| Some areas still light | Hard-refresh to clear the asset cache. Odoo caches bundles aggressively. |
| Theme resets on refresh | Check `localStorage` is not being cleared by a browser extension or privacy setting. |
| White flash on load | Expected on very slow connections. The JS applies the class before OWL mounts but after the first paint. |
| Rebuild assets (dev mode) | Go to **Settings → Technical → Assets**, or append `?debug=assets` to the URL and use the rebuild button. |

---

## License

[LGPL-3](https://www.gnu.org/licenses/lgpl-3.0.html) — Compatible with Odoo Community and Enterprise 18.0.
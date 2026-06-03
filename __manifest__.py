# -*- coding: utf-8 -*-
{
    "name": "Dark Mode",
    'version': '18.0.1.0.0',
    "summary": "Dark Mode toggle for Odoo 18 backend interface",
    "description": """
        Dark Mode for Odoo 18
        =====================
        Adds a sleek dark mode toggle to the top navigation bar.
        User preference is saved in localStorage and persists across sessions.
        
        Features:
        - One-click toggle in the systray (top-right navbar)
        - Full dark theme covering all core Odoo views
        - Smooth CSS transition between themes
        - Saved preference across page reloads
        - Respects system dark mode preference on first load
    """,
    "author": "Custom",
    "category": "Technical/User Interface",
    "license": "LGPL-3",
    "depends": ["web"],
    "data": [],
    "assets": {
        "web.assets_backend": [
            "dark_mode/static/src/css/dark_mode.css",
            "dark_mode/static/src/js/dark_mode.js",
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
}

/** @odoo-module **/

import { Component, onMounted, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

const STORAGE_KEY = "odoo_dark_mode_enabled";
const BG_DARK = "#0f1117";
const BG_DARK_2 = "#181b24";

// ── Colour helpers ───────────────────────────────────────────
// Returns true if a computed or inline colour looks "light"
function isLight(colorStr) {
    if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)") return false;
    const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return false;
    const [r, g, b] = [+m[1], +m[2], +m[3]];
    // Perceived luminance — flag anything brighter than a mid-grey
    return (0.299 * r + 0.587 * g + 0.114 * b) > 80;
}

function darkenElement(el) {
    if (!el || el.nodeType !== 1) return;
    if (!document.documentElement.classList.contains("o_dark_mode")) return;

    const computed = window.getComputedStyle(el).backgroundColor;
    const inline = el.style.backgroundColor;

    if (isLight(computed) || isLight(inline)) {
        // Decide shade: sidebars/panels get bg-2, everything else bg
        const isSidebar = el.closest(
            ".o_search_panel, .o-mail-DiscussSidebar, .settings_tab, " +
            ".o_secondary_menu, .o_sidebar, .o_apps_sidebar"
        );
        el.style.setProperty("background-color", isSidebar ? BG_DARK_2 : BG_DARK, "important");
        el.style.setProperty("background", isSidebar ? BG_DARK_2 : BG_DARK, "important");
        el.style.setProperty("color", "var(--dm-text)", "important");
    }
}

// Recursively scan a subtree
function scanSubtree(root) {
    if (!root || !document.documentElement.classList.contains("o_dark_mode")) return;
    if (root.nodeType !== 1) return;
    darkenElement(root);
    // Walk children (breadth-first, capped to avoid perf issues)
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let count = 0;
    while (walker.nextNode() && count++ < 2000) {
        darkenElement(walker.currentNode);
    }
}

// ── Persistence helpers ──────────────────────────────────────
function isDarkModeEnabled() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyDarkMode(enabled) {
    document.documentElement.classList.toggle("o_dark_mode", enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    if (enabled && document.body) {
        // Small delay lets Odoo finish rendering before we scan
        setTimeout(() => scanSubtree(document.body), 50);
        setTimeout(() => scanSubtree(document.body), 300);
    }
}

// Apply immediately to avoid flash
applyDarkMode(isDarkModeEnabled());

// ── MutationObserver ─────────────────────────────────────────
const _observer = new MutationObserver((mutations) => {
    if (!document.documentElement.classList.contains("o_dark_mode")) return;
    for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "style") {
            darkenElement(m.target);
        } else if (m.type === "childList") {
            m.addedNodes.forEach(n => {
                if (n.nodeType === 1) {
                    darkenElement(n);
                    // Scan subtree of newly added nodes (views being mounted)
                    setTimeout(() => scanSubtree(n), 30);
                }
            });
        }
    }
});

function startObserver() {
    _observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["style", "class"],
    });
    scanSubtree(document.body);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
} else {
    startObserver();
}

// Re-scan on Odoo view changes (hash-based routing)
window.addEventListener("hashchange", () => {
    if (document.documentElement.classList.contains("o_dark_mode")) {
        setTimeout(() => scanSubtree(document.body), 100);
        setTimeout(() => scanSubtree(document.body), 400);
    }
});

// ── OWL Systray Component ────────────────────────────────────
export class DarkModeToggle extends Component {
    static template = "dark_mode.DarkModeToggle";
    static props = {};

    setup() {
        this.state = useState({ enabled: isDarkModeEnabled() });
        onMounted(() => {
            this.state.enabled = isDarkModeEnabled();
        });
    }

    toggle() {
        this.state.enabled = !this.state.enabled;
        applyDarkMode(this.state.enabled);
    }
}

DarkModeToggle.template = owl.xml`
    <div class="o_dark_mode_toggle"
         t-att-title="state.enabled ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
         t-on-click="toggle">
        <span class="o_dm_icon"/>
    </div>
`;

registry.category("systray").add(
    "dark_mode.toggle",
    { Component: DarkModeToggle, sequence: 1 },
    { force: true }
);

/* Wires Tailwind's blue/indigo utilities to the CSS variables in theme.css,
   so classes like text-blue-600 or to-indigo-600 render in the brand colors.
   To change site colors, edit theme.css — not this file. */
(function () {
  function v(n) { return "var(--" + n + ")"; }
  var brand = {
    50: v("brand-50"), 100: v("brand-100"), 200: v("brand-200"),
    300: v("brand-300"), 400: v("brand-400"), 500: v("brand-500"),
    600: v("brand-600"), 700: v("brand-700"), 800: v("brand-800"),
    900: v("brand-900"), 950: v("brand-950")
  };
  var brand2 = {
    50: v("brand-50"), 100: v("brand-100"), 200: v("brand-200"),
    300: v("brand-300"), 400: v("brand-400"), 500: v("brand2-500"),
    600: v("brand2-600"), 700: v("brand2-700"), 800: v("brand2-800"),
    900: v("brand2-900"), 950: v("brand2-950")
  };
  var cfg = (window.tailwind = window.tailwind || {}).config || (tailwind.config = {});
  cfg.theme = cfg.theme || {};
  cfg.theme.extend = cfg.theme.extend || {};
  var c = (cfg.theme.extend.colors = cfg.theme.extend.colors || {});
  c.blue = brand;
  c.indigo = brand2;
  c.brand  = { DEFAULT: v("brand-600"),  glow: v("brand-glow"), dim: v("brand-dim"), veil: v("brand-veil") };
  c.brand2 = { DEFAULT: v("brand2-600"), veil: v("brand2-veil") };
})();

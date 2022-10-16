export const THEME_LIGHT = "theme-light";
export const THEME_DARK = "theme-dark";
export const THEME_SYSTEM = "theme-system";

export const THEMES = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM];

export const THEME_LABELS = {
  [THEME_LIGHT]: "Light",
  [THEME_DARK]: "Dark",
  [THEME_SYSTEM]: "System",
};

export function setThemeClass(from, to) {
  document.body.classList.replace(from, to);
}

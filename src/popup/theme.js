export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";
export const THEME_SYSTEM = "system";

export const THEMES = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM];

export const THEME_LABELS = {
  [THEME_LIGHT]: "Light",
  [THEME_DARK]: "Dark",
  [THEME_SYSTEM]: "System",
};

export function getThemeLabel(themeName) {
  const themeLabel = THEME_LABELS[themeName];

  return themeLabel ? themeLabel : "";
}

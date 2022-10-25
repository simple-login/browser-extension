import SLStorage from './SLStorage';

export const THEME_LIGHT = "theme-light";
export const THEME_DARK = "theme-dark";
export const THEME_SYSTEM = "theme-system";

export const THEMES = [THEME_LIGHT, THEME_DARK, THEME_SYSTEM];

export const THEME_LABELS = {
  [THEME_LIGHT]: "Light",
  [THEME_DARK]: "Dark",
  [THEME_SYSTEM]: "System",
};

export async function getSavedTheme() {
  return (await SLStorage.get(SLStorage.SETTINGS.THEME)) ?? THEME_SYSTEM;
}

export async function setThemeClass(nextTheme, prevTheme) {
  await SLStorage.set(SLStorage.SETTINGS.THEME, nextTheme);

  if (prevTheme === undefined) {
    return document.body.classList.add(nextTheme);
  }

  document.body.classList.replace(prevTheme, nextTheme);
}

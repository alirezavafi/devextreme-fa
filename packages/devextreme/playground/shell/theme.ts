// Loads the DevBox widget theme (themes/build-themes.mjs) and flips the kit's
// tokens with data-theme on <html>.
import type { ThemeMode } from './constants/theme-modes';

const LINK_ID = 'dx-theme';

const themeLoaders = import.meta.glob('../../artifacts/css/dx.devbox.*.css', { query: '?url', import: 'default' });

export function applyTheme(mode: ThemeMode): Promise<void> {
  document.documentElement.dataset.theme = mode;

  const loaderKey = Object.keys(themeLoaders).find((key) => key.endsWith(`dx.devbox.${mode}.css`));
  if (!loaderKey) {
    // eslint-disable-next-line no-console
    console.warn('DevBox theme CSS not found. Run: node playground/themes/build-themes.mjs');
    return Promise.resolve();
  }

  return (themeLoaders[loaderKey]() as Promise<string>).then((href) => new Promise<void>((resolve, reject) => {
    const previous = document.getElementById(LINK_ID);
    if (previous?.getAttribute('href') === href) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = (): void => {
      previous?.remove();
      link.id = LINK_ID;
      resolve();
    };
    link.onerror = (): void => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  }));
}

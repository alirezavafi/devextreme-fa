import $ from 'jquery';

const themeKey = 'currentThemeId';

const themeLoaders = import.meta.glob('../artifacts/css/dx.*.css', { query: '?url', import: 'default' });

const themeList = Object.keys(themeLoaders).map((path) => {
  const match = path.match(/dx\.(.+)\.css$/);
  return match ? match[1] : null;
}).filter(Boolean) as string[];

function groupThemes(themes: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  themes.forEach((theme) => {
    const [group] = theme.split('.');
    const groupName = group.charAt(0).toUpperCase() + group.slice(1);
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(theme);
  });
  return groups;
}

function loadThemeCss(themeId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const oldLink = document.getElementById('theme-stylesheet');
    if (oldLink) oldLink.remove();

    const key = Object.keys(themeLoaders).find((p) => p.includes(`dx.${themeId}.css`));
    if (!key) {
      reject(new Error(`Theme not found: ${themeId}`));
      return;
    }

    (themeLoaders[key]() as Promise<string>).then((cssUrl) => {
      const link = document.createElement('link');
      link.id = 'theme-stylesheet';
      link.rel = 'stylesheet';
      link.href = cssUrl;
      link.onload = (): void => resolve();
      link.onerror = (): void => reject(new Error(`Failed to load theme: ${themeId}`));
      document.head.appendChild(link);
    }).catch(reject);
  });
}

export function setupThemeSelector(containerId: string): Promise<void> {
  const container = document.querySelector<HTMLElement>(`#${containerId}`);
  if (!container) return Promise.resolve();

  if (!themeList.length) {
    // eslint-disable-next-line no-console
    console.warn(
      'No theme CSS found in ../artifacts/css. Widgets will render unstyled.\n'
      + 'Build the themes once with:\n'
      + '  cd packages/devextreme-scss && pnpm exec gulp compile-themes-dev\n'
      + '(outputs to packages/devextreme/artifacts/css/dx.*.css), then reload.',
    );
    return Promise.resolve();
  }

  // Shape the themes into dxSelectBox grouped data ({ key, items: [...] }) so the
  // theme picker matches the calendar/language dxSelectBoxes instead of a native
  // <select>.
  const grouped = groupThemes(themeList);
  const groupedItems = Object.entries(grouped).map(([key, themes]) => ({
    key,
    items: themes.map((theme) => ({ id: theme, text: theme.replaceAll('.', ' ') })),
  }));

  const defaultTheme = themeList.includes('fluent.blue.light') ? 'fluent.blue.light' : themeList[0];
  const savedTheme = window.localStorage.getItem(themeKey) || defaultTheme;

  // Load the saved theme CSS first so the dxSelectBox (and every other widget the
  // caller mounts afterwards) renders styled.
  return loadThemeCss(savedTheme).then(() => {
    $(container).dxSelectBox({
      dataSource: groupedItems,
      grouped: true,
      valueExpr: 'id',
      displayExpr: 'text',
      value: savedTheme,
      width: 220,
      onValueChanged: (e: { value: string }): void => {
        window.localStorage.setItem(themeKey, e.value);
        loadThemeCss(e.value).catch((err) => console.error(err));
      },
    });
  });
}

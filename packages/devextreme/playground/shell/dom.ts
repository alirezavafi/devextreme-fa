// Tiny element factory for the site chrome (the demo content uses DevExtreme).
type Attrs = Record<string, string | undefined>;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
  attrs: Attrs = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  Object.entries(attrs).forEach(([name, value]) => {
    if (value !== undefined) node.setAttribute(name, value);
  });
  return node;
}

export function requireElement<T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element ${selector}`);
  return node;
}

// Collects a page's DevExtreme instances so a rebuild can dispose them all.
interface Disposable {
  dispose: () => void;
  element: () => HTMLElement | { get?: (index: number) => HTMLElement };
}

export class WidgetBag {
  private readonly items: Disposable[] = [];

  add<T>(instance: T): T {
    this.items.push(instance as unknown as Disposable);
    return instance;
  }

  dispose(): void {
    this.items.reverse().forEach((instance) => {
      const element = instance.element();
      const node = element instanceof HTMLElement ? element : element.get?.(0);
      instance.dispose();
      node?.replaceChildren();
    });
    this.items.length = 0;
  }
}

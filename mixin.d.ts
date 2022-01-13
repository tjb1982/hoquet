export type ConstructorOptions = {
    template?: HTMLTemplateElement | string,
    stylesheets?: CSSStyleSheet[],
    attributes?: string[],
    shadowy?: boolean,
    rerenderable?: boolean,
    cacheIDs?: boolean
};

export type RenderOptions = {
    reflect: boolean
};

declare abstract class AHoquet extends HTMLElement {
    getElementById (id: string): HTMLElement | null;
    render (options?: RenderOptions): void;
    get rendered (): boolean;
    static get reflectedAttributes (): string[];
    $: { [key: string]: HTMLElement };
    fragment (...src): DocumentFragment;
}

export default function<T extends new (...args) => HTMLElement>
    (c: T, options?: ConstructorOptions): new (...args) => AHoquet;


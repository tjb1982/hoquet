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

declare abstract class AHoquet {
    getElementById (id: string): HTMLElement | null;
    render (options?: RenderOptions): void;
    get rendered (): boolean;
    static get reflectedAttributes (): string[];
    $: { [key: string]: HTMLElement };
    fragment (...src): DocumentFragment;
}

type makeFn = <T1 extends typeof HTMLElement>(el: T1, opts?: ConstructorOptions) => InstanceType<T1> & AHoquet;

export default makeFn;

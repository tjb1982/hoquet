type Options = {
    template?: HTMLTemplateElement | string,
    stylesheets?: CSSStyleSheet[],
    attributes?: string[],
    shadowy?: boolean,
    rerenderable?: boolean,
    cacheIDs?: boolean
};

declare const Hoquet: (c: class<HTMLElement>, options?: Options) => class<HTMLElement>;
export default Hoquet;


declare type Sources = Record<string, (RegExp[] | boolean)>;

declare const importCSS = (doc: Document, sources: Sources) => CSSStyleSheet;
declare const html = (src: string) => HTMLTemplateElement;
declare const stylesheet = (src: string) => CSSStyleSheet;
declare const template = html;

export {
    importCSS,
    stylesheet,
    html,
    template,
};


declare type Sources = Record<string, (RegExp[])?>;

export function importCSS(doc: Document, sources: Sources): CSSStyleSheet;
export function html(src: TemplateStringsArray, ...args: any[]): HTMLTemplateElement;
export function stylesheet(src: TemplateStringsArray, ...args: any[]): CSSStyleSheet;
declare const template = html;

export {
    importCSS,
    stylesheet,
    html,
    template,
};

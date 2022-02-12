import { MDCDialog } from "@material/dialog";

import materialComponentsLink from "../../../material-components-link.html";
import materialIconsLink from "../../../material-icons-link.html";
import styles from "./dialog.css";

import dialogTemplateSrc from "./dialog.html";


/**
 * Note that `dialog.html` is not used here on purpose.
 * It is stamped each time the dialog opens.
 */
const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    ${materialIconsLink}
    <style>${styles}</style>
`;

const dialogTemplate = document.createElement("template");
dialogTemplate.innerHTML = `
    ${dialogTemplateSrc}
`;

export type ActionConfig = {
    label?: string;
    isPrimary?: boolean;
    handler?: CallableFunction;
};

const CONTENT = Symbol();


export default class Dialog extends HTMLElement {

    private [CONTENT]: DocumentFragment;
    $dialog?: HTMLElement;
    dialog?: MDCDialog;
    actions?: Record<string,ActionConfig>;

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this[CONTENT] =
            template.content.cloneNode(true) as
                DocumentFragment
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
    }

    button(action: string, config: ActionConfig) {
        return `<button class="${
            config.isPrimary ? "primary" : ""
        }" data-mdc-dialog-action="${action}">${config.label}</button>`;
    }

    create(
        title: string,
        content: string,
        actions: Record<string, ActionConfig>,
        isDismissable = false
    ) {
        const tmp = dialogTemplate.content.cloneNode(true) as
            DocumentFragment;
        const $dialog =
            this.$dialog = tmp.getElementById("dialog") as HTMLElement;
        const $content = tmp.getElementById("dialog-content") as
            HTMLElement
        const $title = tmp.getElementById("dialog-title") as
            HTMLElement;

        this.actions = actions;

        const actionEntries = Object.entries(this.actions);
        $title.innerText = title;
        $content.innerHTML = content;
        
        if (actionEntries.length) {
            const $actionList = document.createElement("ul");
            $actionList.id = "action-list";

            actionEntries
                .filter(([_, conf]) => conf.label)
                .forEach(([action, conf]) => {
                    const $li = document.createElement("li");
                    $li.classList.add("button-container");
                    $li.appendChild(
                        document.createRange().createContextualFragment(
                            this.button(action, conf)
                        )
                    );
                    $actionList.appendChild($li);
                });

            $content.appendChild($actionList);
        }

        this.dialog = new MDCDialog($dialog);

        if (!isDismissable) {
            this.dialog.escapeKeyAction = "";
            this.dialog.scrimClickAction = "";
        }

        $dialog.addEventListener("MDCDialog:closing", e => {
            const detail = (e as CustomEvent).detail;
            const action = this.actions?.[detail.action];
            if (action?.handler) {
                action.handler();
            };
            $dialog?.parentNode?.removeChild($dialog);
        });

        if (this.shadowRoot) {
            this.shadowRoot.appendChild(tmp);
            this.dialog?.open();
        }
    }
}

window.customElements.define("hq-dialog", Dialog);

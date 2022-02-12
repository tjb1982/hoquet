import { MDCTextField } from "@material/textfield";
import 'element-internals-polyfill';
import materialComponentsLink from "/material-components-link.html";


import templateSrc from "./textfield.html";
import styles from "./textfield.css";


const template = document.createElement("template");
template.innerHTML = `
    ${materialComponentsLink}
    <style>${styles}</style>
    ${templateSrc}
`;

const inputAttrs = new Set([
    "type", "pattern", "min", "max", "step", "minlength",
    "maxlength", "disabled", "required",
]);

const attributes = [
    ...inputAttrs, "validationmessage", "helper", "persistent-helper"
];

const CONTENT = Symbol();


export default class TextField extends HTMLElement {
    private [CONTENT]: DocumentFragment;
    textField: MDCTextField;
    internals: ElementInternals | any;
    $input: HTMLInputElement;
    $helperText: HTMLElement;


    static formAssociated = true;

    static get observedAttributes() { return attributes; }

    constructor() {
        super();
        this.attachShadow({mode:"open"});
        this.internals = this.attachInternals();
        this[CONTENT] = template.content.cloneNode(true) as
            DocumentFragment;

        const $label =
            this[CONTENT].getElementById("container") as
                Element;
        this.$input =
            this[CONTENT].getElementById("input") as
                HTMLInputElement;
        this.$helperText =
            this[CONTENT].getElementById("helper-text") as
                HTMLElement;
        this.textField = new MDCTextField($label);
    }

    connectedCallback() {
        this.shadowRoot?.appendChild(this[CONTENT]);
        this.$input.addEventListener("input", e => {
            this.internals.setFormValue(this.$input.value);
            this.checkValidity();
        });
    }

    attributeChangedCallback(k: string, p: string, c: string) {
        if (inputAttrs.has(k)) {
            if (c === null) {
                this.$input.removeAttribute(k);
            } else {
                this.$input.setAttribute(k, c);
            }
        }

        if (k === "required") {
            const required = c !== null;
            this.internals.ariaRequired = required;
            this.checkValidity();
        } else if (k === "persistent-helper") {
            this.isPersistentHelper = c !== null;
        } else if (k === "helper") {
            this.helperText = c;
        } else if (k === "disabled") {
            this.textField.disabled = c !== null;
        }
    }

    set helperText(text: string) {
        // this.$["helper-text"].innerText = text;
        this.textField.helperTextContent = text;
    }
    set isPersistentHelper(is: boolean) {
        this.$helperText.classList[is ? "add" : "remove"](
            "mdc-text-field-helper-text--persistent"
        );
    }
    set isValidationHelper(is: boolean) {
        this.$helperText.classList[is ? "add" : "remove"](
            "mdc-text-field-helper-text--validation-msg"
        );
    }

    setCustomValidity(msg: string) {
        this.$input.setCustomValidity(msg);
        // FIXME: this is going to break, because if you ever end up
        // setting `validationmessage` like this, then if you come back
        // around to a "normal" validation error, you'll be left with
        // this blank message, wondering where the initial message went.
        this.setAttribute("validationmessage", msg);
    }

    get validity(): ValidityState {
        return this.internals.validity;
    }

    get value() {
        return this.$input.value;
    }

    set value(x: string) {
        this.internals.setFormValue(x);
        this.textField.value = x;
    }

    validityToValidationMessage(validity: ValidityState): string {
        const attr = this.getAttribute("validationmessage");
        if (attr) {
            return attr;
        }

        switch (true) {
            case validity.valueMissing:
                return "Required";
            case validity.badInput:
                return "Bad input";
            case validity.patternMismatch:
                return "Pattern mismatch";
            case validity.rangeOverflow:
            case validity.rangeUnderflow:
                return `Out of range: minimum is ${this.getAttribute("min") || "any"}; maximum is ${this.getAttribute("max") || "any"}`;
            case validity.tooLong:
                return `Too long: maximmum length is ${this.getAttribute("maxlength")}`;
            case validity.tooShort:
                return `Too short: minimumlength is ${this.getAttribute("minlength")}`;
            case validity.typeMismatch:
                return `Type mismatch: expected ${this.getAttribute("type") || "text"}`;
            case validity.stepMismatch:
                return `Step mismatch: can only increment by ${this.getAttribute("step")}`;
            case validity.customError:
                return "Invalid";
            default:
                return ""
        }
    }

    checkValidity(): boolean {
        const valid = this.$input.checkValidity();
        if (!this.shadowRoot?.contains(this.$input))
            return false;

        if (!valid) {
            this.internals.setValidity(
                this.$input.validity,
                this.validityToValidationMessage(this.$input.validity),
                this.$input
            );
        } else {
            this.internals.setValidity(this.$input.validity);
            this.setCustomValidity("");
        }
        return valid;
    }

    reportValidity(): boolean {
        // interact with textField to ensure it provides feedback
        if (!this.checkValidity()) {
            this.helperText = this.internals.validationMessage;
            this.isPersistentHelper = true;
            this.isValidationHelper = true;
        } else {
            this.helperText = this.getAttribute("helper") ?? "";
            this.isPersistentHelper = this.hasAttribute("persistent-helper");
            this.isValidationHelper = false;
        }

        return (
            this.textField.valid = this.internals.reportValidity()
        );
    }

    focus() {
        this.textField.focus();
    }
}

window.customElements.define("hq-forms-textfield", TextField);

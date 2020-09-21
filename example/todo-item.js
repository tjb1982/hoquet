import Hoquet from "../mixin.js";
import { rendered, stylesheet, template } from "../utils.js";


const styles = stylesheet`
#item {
    cursor: pointer;
    list-style: none;
    padding: 10px 15px;
    background-color: #fafafa;
    border: 1px solid #ff0;
    margin: 5px 0;
    font-family: sans-serif;
    font-size: 2rem;
}

.todo #name { color: #33a; }
.doing #name { color: orange }
.doing #name::after { content: " (in progress)" }
.done #name {
    text-decoration: line-through;
    color: #888;
}

#name {
    width: 75%;
}
#x {
    text-decoration: none!important;
    display: block;
    float: right;
    background-color: #fff;
    padding: 0 10px;
    font-size: 2rem;
}
`;

const states = ["todo", "doing", "done"];

export default class TodoItem extends Hoquet(HTMLElement, {
    stylesheets: [styles],
    attributes: ["state", "name"],
    template: template`
        <li id="item">
            <span id="name"></span>
            <span id="x">x</span>
        </li>
    `
}) {
    
    constructor(name) {
        super();
        this.name = name;
        this.state = states[0];
    }

    connectedCallback() {
        this.render();

        this.$["item"].addEventListener("click", e => this.toggleState());
        
        this.$["x"].addEventListener("click", e => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent("item-deleted", {
                composed: true, bubbles: true, detail: {item: this}
            }));
        });
    }

    attributeChangedCallback(key, prev, curr) {
        if (!rendered(this))
            return;

        if (key === "state") {
            states.forEach(state => this.$.item.classList.remove(state));
            this.$.item.classList.add(curr);
        } else if (key === "name") {
            this.$.name.innerText = curr;
        }
    }

    toggleState() {
        const currentStateIndex = states.indexOf(this.state);
        this.state = states[
            currentStateIndex >= states.length - 1
                ? 0 : currentStateIndex + 1
        ];
    }

    /**
     * If you would prefer to render a component with its state interpolated
     * into the template at "runtime" (as we're doing below with `this.name`),
     * you can provide a `template` getter in lieu of a declared template,
     * which can be either a structured list of S-expressions like the below
     * form, an `HTMLTemplateElement`, or a normal template string, such as:
     * 
     * `<li id="item">
     *     <span class="name">${this.name}</span>
     *     <span id="x">x</span>
     * </li>`
     * 
     * This is unnecessary in most cases, though, because the state could
     * be handled by the delivered `attributeChangedCallback` mechanism,
     * which provides better flexibility and performance, and then you only
     * render once, which means that the browser doesn't have to construct any
     * elements more than once, and you can describe imperatively how to
     * surgically change their state within `attributeChangedCallback`.
     */
    // get template() {
    //     return (
    //         ["li", {id: "item"},
    //          ["span", {id: "name"}, this.name],
    //          ["span", {id: "x"}, "x"]]
    //     );
    // }

}

window.customElements.define("todo-item", TodoItem);
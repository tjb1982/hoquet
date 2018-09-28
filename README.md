# hoquet
Simple JavaScript HTML/XML templating using Arrays as S-expressions (loosely based on Clojure's Hiccup).

```javascript
import { render } from "./hoquet.js";

const things = ["bread", "milk", "eggs"];
render(
  ["ul", {class: ["things", "list"]}
  , things.map(x => ["li", x])
  ]
);
// <ul class="things list"><li>bread</li><li>milk</li><li>eggs</li></ul>

render(
  ["link", {rel: "stylesheet", href: "styles.css"}]
)
// <link rel="stylesheet" href="styles.css" />
```

You can see an example todo app using the web component mixin by running the "demo" script from the top level of the repo using npm/yarn.

```bash
$ yarn install && yarn demo
```


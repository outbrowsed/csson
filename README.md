# CSSON

![license](https://img.shields.io/badge/License-MIT-yellow.svg)
![stars](https://img.shields.io/github/stars/outbrowsed/csson?style=social)
![forks](https://img.shields.io/github/forks/outbrowsed/csson?style=social)
![cdn](https://img.shields.io/badge/CDN-jsdelivr-blue)
[![badge](https://data.jsdelivr.com/v1/package/gh/outbrowsed/csson/badge)](https://www.jsdelivr.com/package/gh/outbrowsed/csson)

**CSSON** is a superset of JSON designed to make configuration and styling files more flexible. It allows:

* Comments (single line `//` or jsdoc `/* */`)
* Optional semicolons
* Units like `px`, `%`, `em`
* Hex colors
* Easy parsing and stringifying

Perfect for configs, themes, and dynamic settings in js projects.

---

Demo:
[Demo](./demo.html)

---

## Features

* Allows comments
* css like syntax
* Can be parsed and stringified with js similar to json
* Case insensitive parser available (can be used as `CSSON.funct` or `csson.funct`)
* Lightweight and fast

---

## Installation

Include via es Module:

```js

import { CSSON } from "https://cdn.jsdelivr.net/gh/outbrowsed/csson/index.mjs";
````

---

## Usage

### Parsing CSSON

```js

import { CSSON } from "./index.mjs";

const text = `
theme {
  color: #ff0000;
  fontSize: 16px;
  darkMode: true;
}
users [
  "alice",
  "bob"
]
`;

const parsed = CSSON.parse(text);
console.log(parsed);
```

### Stringifying it

```js

const obj = {
  theme: { color: "#ff0000", fontSize: "16px", darkMode: true },
  users: ["alice", "bob"]
};

const str = CSSON.stringify(obj);
console.log(str);
```

---

## Features Demonstrated

* **Comments**

```csson

// this is a line comment
/* this is a block (jsdoc) comment */
theme {
  color: #000;
}
```

* **Units and colors**

```csson

theme {
  fontSize: 16px;
  margin: 10%;
  color: #ff00ff;
}
```

* **Arrays**

```csson

users [
  "alice",
  "bob",
  "charlie"
]
```

* **Case insensitive keys**

```csson

THEME {
  COLOR: #fff;
}
```

---

## Advanced

* Nested objects
* Mix of arrays and objects
* Supports all json primitive types + comments and units
* Case insensitive parsing: `CSSON.parse` will accept keys in any casing

---

## License

AGPL v3 License © 2025 OutBrowsed
[https://www.gnu.org/licenses/agpl-3.0.txt](https://www.gnu.org/licenses/agpl-3.0.txt)

const patterns = {
	whitespace: /\s+/y,
	blockComment: /\/\*[\s\S]*?\*\//y,
	lineComment: /\/\/[^\n]*/y,
	string: /["'`]/,
	hex: /#[0-9a-fA-F]+/y,
	number: /-?(?:\d+\.?\d*|\.\d+)/y,
	unit: /[a-zA-Z%]+/y,
	identifier: /[a-zA-Z_$][a-zA-Z0-9_$-]*/y,
	operators: /[{}[\]:;,]/y,
};

const keywords = { true: true, false: false, null: null, undefined: undefined };

const tokenize = (text) => {
	const tokens = [];
	let i = 0, len = text.length;

	const testPattern = (pattern) => {
		pattern.lastIndex = i;
		const match = pattern.exec(text);
		return match ? match[0] : null;
	};

	while (i < len) {
		const char = text[i];

		const ws = testPattern(patterns.whitespace);
		if (ws) { i += ws.length; continue; }

		const bc = testPattern(patterns.blockComment);
		if (bc) { i += bc.length; continue; }

		const lc = testPattern(patterns.lineComment);
		if (lc) { i += lc.length; continue; }

		if (patterns.string.test(char)) {
			const quote = char;
			let value = "";
			i++;
			while (i < len) {
				if (text[i] === quote) break;
				if (text[i] === "\\" && quote !== "`") {
					i++;
					if (i < len) {
						const esc = text[i];
						value += esc === "n" ? "\n" : esc === "t" ? "\t" : esc === "r" ? "\r" : esc;
						i++;
					}
				} else {
					value += text[i++];
				}
			}
			tokens.push({ type: "STRING", value });
			if (text[i] === quote) i++;
			continue;
		}

		const hex = testPattern(patterns.hex);
		if (hex) { tokens.push({ type: "HEX", value: hex }); i += hex.length; continue; }

		const num = testPattern(patterns.number);
		if (num) {
			i += num.length;
			const unit = testPattern(patterns.unit);
			if (unit) { tokens.push({ type: "UNIT", value: num + unit }); i += unit.length; }
			else { tokens.push({ type: "NUMBER", value: parseFloat(num) }); }
			continue;
		}

		const id = testPattern(patterns.identifier);
		if (id) { i += id.length; tokens.push({ type: Object.hasOwn(keywords, id) ? "KEYWORD" : "IDENTIFIER", value: keywords[id] ?? id }); continue; }

		const op = testPattern(patterns.operators);
		if (op) {
			const map = { "{": "BRACE_OPEN", "}": "BRACE_CLOSE", "[": "BRACKET_OPEN", "]": "BRACKET_CLOSE", ":": "COLON", ";": "SEMICOLON", ",": "COMMA" };
			tokens.push({ type: map[op] });
			i += op.length;
			continue;
		}

		i++;
	}

	return tokens;
};

const parse = (tokens) => {
	let pos = 0;
	const len = tokens.length;

	const parseValue = () => {
		const token = tokens[pos];
		if (!token) throw new Error("Unexpected end");
		switch (token.type) {
			case "BRACE_OPEN": return parseObject();
			case "BRACKET_OPEN": return parseArray();
			case "STRING":
			case "NUMBER":
			case "HEX":
			case "UNIT":
			case "IDENTIFIER":
			case "KEYWORD": return tokens[pos++].value;
			default: throw new Error(`Unexpected token: ${token.type}`);
		}
	};

	const consumeSeparator = () => {
		if (pos < len && ["COMMA", "SEMICOLON"].includes(tokens[pos].type)) pos++;
	};

	const parseArray = () => {
		pos++;
		const arr = [];
		while (pos < len && tokens[pos].type !== "BRACKET_CLOSE") {
			arr.push(parseValue());
			consumeSeparator();
		}
		if (pos < len && tokens[pos].type === "BRACKET_CLOSE") pos++;
		return arr;
	};

	const parseObject = () => {
		pos++;
		const obj = {};
		while (pos < len && tokens[pos].type !== "BRACE_CLOSE") {
			const keyToken = tokens[pos++];
			const keyName = keyToken.value;
			if (pos < len && tokens[pos].type === "COLON") {
				pos++;
				obj[keyName] = parseValue();
			} else {
				obj[keyName] = true;
			}
			consumeSeparator();
		}
		if (pos < len && tokens[pos].type === "BRACE_CLOSE") pos++;
		return obj;
	};

	const root = {};
	while (pos < len) {
		const token = tokens[pos];
		if (!token || (token.type !== "IDENTIFIER" && token.type !== "STRING")) { pos++; continue; }
		const keyToken = tokens[pos++];
		const keyName = keyToken.value;
		if (pos < len && tokens[pos].type === "BRACE_OPEN") root[keyName] = parseObject();
		else if (pos < len && tokens[pos].type === "COLON") { pos++; root[keyName] = parseValue(); }
		else if (pos < len && tokens[pos].type === "BRACKET_OPEN") root[keyName] = parseArray();
	}

	return root;
};

const parseCSSON = (text) => parse(tokenize(text));

const stringifyCSSON = (obj, indent = 0) => {
	const space = "  ".repeat(indent);
	const nextSpace = "  ".repeat(indent + 1);

	if (obj === null || typeof obj !== "object") {
		if (typeof obj === "string" && !/^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(obj)) return `"${obj}"`;
		return String(obj);
	}

	if (Array.isArray(obj)) {
		const items = obj.map(item => `${nextSpace}${stringifyCSSON(item, indent + 1)}`).join(",\n");
		return `[\n${items}\n${space}]`;
	}

	const entries = Object.entries(obj).map(([k, v]) => {
		const key = /^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(k) ? k : `"${k}"`;
		if (typeof v === "object" && v !== null && !Array.isArray(v)) return `${key} ${stringifyCSSON(v, indent + 1)}`;
		return `${nextSpace}${key}: ${stringifyCSSON(v, indent + 1)}`;
	});

	return `{\n${entries.join("\n")}\n${space}}`;
};

const CSSONparse = parseCSSON;
const CSSONstringify = stringifyCSSON;

export const CSSON = {
	parse: parseCSSON,
	CSSONparse,
	stringify: stringifyCSSON,
	CSSONstringify,
};

export const csson = CSSON;

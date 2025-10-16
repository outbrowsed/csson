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
	let i = 0,
		len = text.length;

	while (i < len) {
		const char = text[i];

		patterns.whitespace.lastIndex = i;
		if (patterns.whitespace.test(text)) {
			i = patterns.whitespace.lastIndex;
			continue;
		}

		patterns.blockComment.lastIndex = i;
		if (patterns.blockComment.test(text)) {
			i = patterns.blockComment.lastIndex;
			continue;
		}

		patterns.lineComment.lastIndex = i;
		if (patterns.lineComment.test(text)) {
			i = patterns.lineComment.lastIndex;
			continue;
		}

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
						value +=
							esc === "n"
								? "\n"
								: esc === "t"
									? "\t"
									: esc === "r"
										? "\r"
										: esc;
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

		patterns.hex.lastIndex = i;
		if (char === "#" && patterns.hex.test(text)) {
			tokens.push({
				type: "HEX",
				value: text.slice(i, patterns.hex.lastIndex),
			});
			i = patterns.hex.lastIndex;
			continue;
		}

		patterns.number.lastIndex = i;
		if (patterns.number.test(text)) {
			const end = patterns.number.lastIndex;
			patterns.unit.lastIndex = end;
			if (patterns.unit.test(text)) {
				tokens.push({
					type: "UNIT",
					value: text.slice(i, patterns.unit.lastIndex),
				});
				i = patterns.unit.lastIndex;
			} else {
				tokens.push({ type: "NUMBER", value: parseFloat(text.slice(i, end)) });
				i = end;
			}
			continue;
		}

		patterns.identifier.lastIndex = i;
		if (patterns.identifier.test(text)) {
			const value = text.slice(i, patterns.identifier.lastIndex);
			i = patterns.identifier.lastIndex;
			tokens.push({
				type: Object.hasOwn(keywords, value) ? "KEYWORD" : "IDENTIFIER",
				value: keywords[value] ?? value,
			});
			continue;
		}

		switch (char) {
			case "{":
				tokens.push({ type: "BRACE_OPEN" });
				break;
			case "}":
				tokens.push({ type: "BRACE_CLOSE" });
				break;
			case "[":
				tokens.push({ type: "BRACKET_OPEN" });
				break;
			case "]":
				tokens.push({ type: "BRACKET_CLOSE" });
				break;
			case ":":
				tokens.push({ type: "COLON" });
				break;
			case ";":
				tokens.push({ type: "SEMICOLON" });
				break;
			case ",":
				tokens.push({ type: "COMMA" });
				break;
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
			case "BRACE_OPEN":
				return parseObject();
			case "BRACKET_OPEN":
				return parseArray();
			case "STRING":
			case "NUMBER":
			case "HEX":
			case "UNIT":
			case "IDENTIFIER":
			case "KEYWORD":
				return tokens[pos++].value;
			default:
				throw new Error(`Unexpected token: ${token.type}`);
		}
	};

	const parseArray = () => {
		pos++;
		const arr = [];
		while (pos < len && tokens[pos].type !== "BRACKET_CLOSE") {
			arr.push(parseValue());
			if (
				pos < len &&
				(tokens[pos].type === "COMMA" || tokens[pos].type === "SEMICOLON")
			)
				pos++;
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
				const value = parseValue();
				obj[keyName] = value;
			} else {
				obj[keyName] = true;
			}

			if (
				pos < len &&
				(tokens[pos].type === "SEMICOLON" || tokens[pos].type === "COMMA")
			)
				pos++;
		}
		if (pos < len && tokens[pos].type === "BRACE_CLOSE") pos++;
		return obj;
	};

	const root = {};
	while (pos < len) {
		const token = tokens[pos];
		if (!token || (token.type !== "IDENTIFIER" && token.type !== "STRING")) {
			pos++;
			continue;
		}
		const keyToken = tokens[pos++];
		const keyName = keyToken.value;

		if (pos < len && tokens[pos].type === "BRACE_OPEN") {
			root[keyName] = parseObject();
		} else if (pos < len && tokens[pos].type === "COLON") {
			pos++;
			root[keyName] = parseValue();
		} else if (pos < len && tokens[pos].type === "BRACKET_OPEN") {
			root[keyName] = parseArray();
		}
	}

	return root;
};

const parseCSSON = (text) => parse(tokenize(text));

const stringifyCSSON = (obj, indent = 0) => {
	const space = "  ".repeat(indent);
	const nextSpace = "  ".repeat(indent + 1);

	if (obj === null || typeof obj !== "object") {
		return typeof obj === "string" ? `"${obj}"` : String(obj);
	}

	if (Array.isArray(obj)) {
		const items = obj
			.map((item) => `${nextSpace}${stringifyCSSON(item, indent + 1)}`)
			.join(",\n");
		return `[\n${items}\n${space}]`;
	}

	const entries = Object.entries(obj).map(([k, v]) => {
		if (typeof v === "object" && v !== null && !Array.isArray(v)) {
			return `${k} ${stringifyCSSON(v, indent + 1)}`;
		}
		return `${nextSpace}${k}: ${stringifyCSSON(v, indent + 1)};`;
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

import { csson } from "https://cdn.jsdelivr.net/gh/outbrowsed/csson@main/src/index.min.mjs";

let parsedObj = null;
let parsedJsonObj = null;
let debounceTimer = null;
let jsonDebounceTimer = null;
const demo = "example.csson";

const toast = document.getElementById("toast");

const showToast = (msg, type = "success") => {
	toast.textContent = msg;
	toast.className = `toast ${type} show`;
	setTimeout(() => toast.classList.remove("show"), 3000);
};

const cssonInput = document.getElementById("cssoncode");
const parsebutton = document.getElementById("parsecsson");
const fileInput = document.getElementById("fileInput");
const exportJsonBtn = document.getElementById("export");
const objOutput = document.getElementById("parsedoutput");
const output = document.getElementById("stringifiedOutput");

const update = () => {
	objOutput.className = "language-json";
	output.className = "language-json";
	objOutput.textContent = JSON.stringify(parsedObj, null, 2);
	output.textContent = csson.stringify(parsedObj);
	delete objOutput.dataset.highlighted;
	delete output.dataset.highlighted;
	hljs.highlightElement(objOutput);
	hljs.highlightElement(output);
	objOutput.parentElement.classList.add("fade-in");
	output.parentElement.classList.add("fade-in");
	setTimeout(() => {
		objOutput.parentElement.classList.remove("fade-in");
		output.parentElement.classList.remove("fade-in");
	}, 300);
};

const parseInput = () => {
	try {
		parsedObj = csson.parse(cssonInput.value);
		update();
	} catch (e) {
		showToast(`Parse error: ${e.message}`, "error");
	}
};

const loadcsson = async (file) => {
	try {
		const text = await (await fetch(file)).text();
		cssonInput.value = text;
		parseInput();
	} catch (e) {
		objOutput.textContent = `failed to load csson file: ${e.message}`;
	}
};

const exportJson = () => {
	if (!parsedObj) {
		showToast("Parse CSSON first", "error");
		return;
	}
	const blob = new Blob([JSON.stringify(parsedObj, null, 2)], {
		type: "application/json",
	});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "export.json";
	a.click();
	showToast("JSON exported successfully");
};

cssonInput.addEventListener("input", () => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(parseInput, 500);
});

cssonInput.addEventListener("keydown", (e) => {
	if (e.key === "Tab") {
		e.preventDefault();
		const start = e.target.selectionStart;
		const end = e.target.selectionEnd;
		e.target.value =
			`${e.target.value.substring(0, start)}  ${e.target.value.substring(end)}`;
		e.target.selectionStart = e.target.selectionEnd = start + 2;
	}
	if (e.key === "Enter") {
		const start = e.target.selectionStart;
		const lines = e.target.value.substring(0, start).split("\n");
		const currentLine = lines[lines.length - 1];
		const indent = currentLine.match(/^\s*/)[0];
		setTimeout(() => {
			const newStart = e.target.selectionStart;
			e.target.value =
				e.target.value.substring(0, newStart) +
				indent +
				e.target.value.substring(newStart);
			e.target.selectionStart = e.target.selectionEnd =
				newStart + indent.length;
		}, 0);
	}
	if (e.ctrlKey && e.key === "Enter") {
		e.preventDefault();
		parseInput();
	}
});

document
	.getElementById("import")
	.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
	if (e.target.files[0]) {
		const reader = new FileReader();
		reader.onload = (ev) => {
			cssonInput.value = ev.target.result;
			parseInput();
			showToast("File imported successfully");
		};
		reader.onerror = () => showToast("Failed to read file", "error");
		reader.readAsText(e.target.files[0]);
	}
});

parsebutton.addEventListener("click", parseInput);
exportJsonBtn.addEventListener("click", exportJson);

const jsonInput = document.getElementById("jsoncode");
const parsejsonbutton = document.getElementById("parsejson");
const jsonFileInput = document.getElementById("jsonFileInput");
const exportCssonBtn = document.getElementById("exportcsson");
const jsonObjOutput = document.getElementById("parsedjsonoutput");

const updateJson = () => {
	jsonObjOutput.className = "language-css";
	jsonObjOutput.textContent = csson.stringify(parsedJsonObj);
	delete jsonObjOutput.dataset.highlighted;
	hljs.highlightElement(jsonObjOutput);
	jsonObjOutput.parentElement.classList.add("fade-in");
	setTimeout(() => {
		jsonObjOutput.parentElement.classList.remove("fade-in");
	}, 300);
};

const parseJsonInput = () => {
	try {
		parsedJsonObj = JSON.parse(jsonInput.value);
		updateJson();
	} catch (e) {
		showToast(`Parse error: ${e.message}`, "error");
	}
};

const _exportCsson = () => {
	if (!parsedJsonObj) {
		showToast("Parse JSON first", "error");
		return;
	}
	const blob = new Blob([csson.stringify(parsedJsonObj)], {
		type: "text/plain",
	});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "export.csson";
	a.click();
	showToast("CSSON exported successfully");
};

const exportjson = () => {
	if (!parsedObj) {
		showToast("Parse CSSON first", "error");
		return;
	}
	const blob = new Blob([JSON.stringify(parsedObj, null, 2)], {
		type: "application/json",
	});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "export.json";
	a.click();
	showToast("JSON exported successfully");
};

const exportcsson = () => {
	if (!parsedJsonObj) {
		showToast("Parse JSON first", "error");
		return;
	}
	const blob = new Blob([csson.stringify(parsedJsonObj)], {
		type: "text/plain",
	});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "export.csson";
	a.click();
	showToast("CSSON exported successfully");
};

cssonInput.addEventListener("input", () => {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(parseInput, 500);
});

jsonInput.addEventListener("input", () => {
	clearTimeout(jsonDebounceTimer);
	jsonDebounceTimer = setTimeout(parseJsonInput, 500);
});

cssonInput.addEventListener("keydown", (e) => {
	if (e.key === "Tab") {
		e.preventDefault();
		const start = e.target.selectionStart;
		const end = e.target.selectionEnd;
		e.target.value =
			`${e.target.value.substring(0, start)}  ${e.target.value.substring(end)}`;
		e.target.selectionStart = e.target.selectionEnd = start + 2;
	}
	if (e.key === "Enter") {
		const start = e.target.selectionStart;
		const lines = e.target.value.substring(0, start).split("\n");
		const currentLine = lines[lines.length - 1];
		const indent = currentLine.match(/^\s*/)[0];
		setTimeout(() => {
			const newStart = e.target.selectionStart;
			e.target.value =
				e.target.value.substring(0, newStart) +
				indent +
				e.target.value.substring(newStart);
			e.target.selectionStart = e.target.selectionEnd =
				newStart + indent.length;
		}, 0);
	}
	if (e.ctrlKey && e.key === "Enter") {
		e.preventDefault();
		parseInput();
	}
});

jsonInput.addEventListener("keydown", (e) => {
	if (e.key === "Tab") {
		e.preventDefault();
		const start = e.target.selectionStart;
		const end = e.target.selectionEnd;
		e.target.value =
			`${e.target.value.substring(0, start)}  ${e.target.value.substring(end)}`;
		e.target.selectionStart = e.target.selectionEnd = start + 2;
	}
	if (e.key === "Enter") {
		const start = e.target.selectionStart;
		const lines = e.target.value.substring(0, start).split("\n");
		const currentLine = lines[lines.length - 1];
		const indent = currentLine.match(/^\s*/)[0];
		setTimeout(() => {
			const newStart = e.target.selectionStart;
			e.target.value =
				e.target.value.substring(0, newStart) +
				indent +
				e.target.value.substring(newStart);
			e.target.selectionStart = e.target.selectionEnd =
				newStart + indent.length;
		}, 0);
	}
	if (e.ctrlKey && e.key === "Enter") {
		e.preventDefault();
		parseJsonInput();
	}
});

document.querySelectorAll(".copyBtn").forEach((btn) => {
	btn.addEventListener("click", () => {
		const targetId = btn.getAttribute("data-target");
		const content = document.getElementById(targetId).textContent;
		const icon = btn.querySelector(".icon");
		const check = btn.querySelector(".check");
		navigator.clipboard.writeText(content).then(() => {
			icon.style.opacity = "0";
			check.style.opacity = "1";
			showToast("Copied to clipboard");
			setTimeout(() => {
				icon.style.opacity = "1";
				check.style.opacity = "0";
			}, 1200);
		});
	});
});

document
	.getElementById("import")
	.addEventListener("click", () => fileInput.click());

document
	.getElementById("importjson")
	.addEventListener("click", () => jsonFileInput.click());

fileInput.addEventListener("change", (e) => {
	if (e.target.files[0]) {
		const reader = new FileReader();
		reader.onload = (ev) => {
			cssonInput.value = ev.target.result;
			parseInput();
			showToast("File imported successfully");
		};
		reader.onerror = () => showToast("Failed to read file", "error");
		reader.readAsText(e.target.files[0]);
	}
});

jsonFileInput.addEventListener("change", (e) => {
	if (e.target.files[0]) {
		const reader = new FileReader();
		reader.onload = (ev) => {
			jsonInput.value = ev.target.result;
			parseJsonInput();
			showToast("File imported successfully");
		};
		reader.onerror = () => showToast("Failed to read file", "error");
		reader.readAsText(e.target.files[0]);
	}
});

parsebutton.addEventListener("click", parseInput);
parsejsonbutton.addEventListener("click", parseJsonInput);
exportJsonBtn.addEventListener("click", exportjson);

exportCssonBtn.addEventListener("click", exportcsson);
loadcsson(demo);

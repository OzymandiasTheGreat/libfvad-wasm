import builder, { VADMode, VADEvent, VAD_FRAME } from "./vad.js"


const ISNODE = typeof process ===  "object" && typeof process.versions === "object" && typeof process.versions.node === "string";


export default async function() {
	const uri = new URL("../dist/libfvad.wasm", import.meta.url);
	if (!ISNODE) {
		return fetch(uri.toString()).then((response) => response.arrayBuffer()).then((BINARY) => builder(BINARY));
	}
	import("fs").then((fs) => new Promise((resolve, reject) => fs.readFile(uri.pathname, (err, data) => {
		if (err) {
			reject(err);
		}
		resolve(data);
	}))).then((BINARY) => builder(BINARY));
}

export { VADMode, VADEvent, VAD_FRAME };

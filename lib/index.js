import builder, { VADMode, VADEvent, VAD_FRAME } from "./vad.js"


const ISNODE = typeof process ===  "object" && typeof process.versions === "object" && typeof process.versions.node === "string";


export default async function() {
	const uri = new URL("../dist/libfvad.wasm", import.meta.url);
	if (!ISNODE) {
		return fetch(uri.toString()).then((response) => response.arrayBuffer()).then((BINARY) => builder(BINARY));
	}
	const fs = await import("fs");
	const buffer = fs.readFileSync(uri.pathname);
	return builder(buffer);
}

export { VADMode, VADEvent, VAD_FRAME };

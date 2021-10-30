import builder, { VADMode, VADEvent, FRAME_SIZE } from "./vad.js"


const ISNODE = typeof process ===  "object" && typeof process.versions === "object" && typeof process.versions.node === "string";


export default async function() {
	const uri = new URL("../dist/libfvad.wasm", import.meta.url);
	if (!ISNODE) {
		return fetch(uri.toString()).then((response) => response.arrayBuffer()).then((BINARY) => builder(BINARY));
	}
	const fs = await import("fs");
	const url = await import("url");
	const buffer = fs.readFileSync(url.fileURLToPath(uri.toString()));
	return builder(buffer);
}

export { VADMode, VADEvent, FRAME_SIZE };

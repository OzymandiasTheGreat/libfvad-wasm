import { spawn } from "child_process";
import process from "process";
import BlockStream from "block-stream2";
import VADBuilder, { VADMode } from "@ozymandiasthegreat/vad";


// Apparently global process is not available in esm, but block-stream2 depends on it
global.process = process;


VADBuilder().then((VAD) => {
	const vad = new VAD(VADMode.VERY_AGGRESSIVE, 16000);
	const bufferSize = vad.getMinBufferSize(1024);
	const stream = new BlockStream({ size: bufferSize, zeroPadding: false });
	const proc = spawn("arecord", ["-c", "1", "-r", "16000", "-f", "S16_LE"]);
	stream.on("data", (data) => console.log(vad.processBuffer(new Int16Array(data.buffer))));
	proc.stdout.pipe(stream);
});

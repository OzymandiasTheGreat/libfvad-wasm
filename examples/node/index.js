import { spawn } from "child_process";
import VADBuilder, { VADMode } from "@ozymandiasthegreat/vad";


VADBuilder().then((VAD) => {
	const vad = new VAD(VADMode.NORMAL, 16000);
	process = spawn("arecord", ["-c", "1", "-r", "16000", "-f", "U8"]);
	process.stdout.on("data", (data) => console.log(vad.processBuffer(new Int16Array(data))));
	mic.start();
});

import "globals";
import VADBuilder, { VADMode, VADEvent, VAD_FRAME } from "@ozymandiasthegreat/vad";
import { lcm } from "./math";


const SAMPLE_RATE = 16000;
// Use Least Common Multiple of MinBufferSize and VAD_FRAME to avoid padding frames
const BUFFER_SIZE = lcm(VAD_FRAME, android.media.AudioRecord.getMinBufferSize(
	SAMPLE_RATE,
	android.media.AudioFormat.CHANNEL_IN_MONO,
	android.media.AudioFormat.ENCODING_PCM_8BIT,
));
const BUFFER = Array.create("byte", BUFFER_SIZE);
const recorder = new android.media.AudioRecord(
	android.media.MediaRecorder.AudioSource.VOICE_RECOGNITION,
	SAMPLE_RATE,
	android.media.AudioFormat.CHANNEL_IN_MONO,
	android.media.AudioFormat.ENCODING_PCM_8BIT,
	BUFFER_SIZE,
);


self.onmessage = (msg: MessageEvent) => {
	switch (msg.data) {
		case "START":
			VADBuilder().then((VAD) => {
				const vad = new VAD(VADMode.LOW_BITRATE, 16000);
				recorder.startRecording();
				while (true) {
					recorder.read(BUFFER, 0, BUFFER_SIZE, 0);
					// If there's easier way convert data to format VAD can consume, tell me
					const res = vad.processBuffer(Int16Array.from(Uint8Array.from(BUFFER)));
					switch (res) {
						case VADEvent.ERROR:
							// Typescript has wrong signature for postMessage
							// If you pass extra args as the type requires,
							// the call fails silently
							(<any> self).postMessage("ERROR");
							break;
						case VADEvent.SILENCE:
							(<any> self).postMessage("SILENCE...");
							break;
						case VADEvent.VOICE:
							(<any> self).postMessage("VOICE!");
							break;
					}
				}
			});
	}
}

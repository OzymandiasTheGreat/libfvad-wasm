import "globals";
import VADBuilder, { VADMode, VADEvent } from "@ozymandiasthegreat/vad";


self.onmessage = (msg: MessageEvent) => {
	switch (msg.data) {
		case "START":
			VADBuilder().then((VAD) => {
				const SAMPLE_RATE = 16000;
				const vad = new VAD(VADMode.VERY_AGGRESSIVE, SAMPLE_RATE);
				const BUFFER_SIZE = vad.getMinBufferSize(android.media.AudioRecord.getMinBufferSize(
					SAMPLE_RATE,
					android.media.AudioFormat.CHANNEL_IN_MONO,
					android.media.AudioFormat.ENCODING_PCM_16BIT,
				));
				const BUFFER = Array.create("byte", BUFFER_SIZE);
				const recorder = new android.media.AudioRecord(
					android.media.MediaRecorder.AudioSource.VOICE_RECOGNITION,
					SAMPLE_RATE,
					android.media.AudioFormat.CHANNEL_IN_MONO,
					android.media.AudioFormat.ENCODING_PCM_16BIT,
					BUFFER_SIZE,
				);

				recorder.startRecording();
				while (true) {
					recorder.read(BUFFER, 0, BUFFER_SIZE, 0);
					// If there's easier way convert data to format VAD can consume, tell me
					const res = vad.processBuffer(new Int16Array(Uint8Array.from(BUFFER).buffer));
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

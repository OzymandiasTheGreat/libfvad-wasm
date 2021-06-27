/* Taken from https://github.com/swansontec/rfc4648.js released under MIT license */
const base64Encoding = {
	chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	bits: 6
}

function parse(string, encoding = base64Encoding, opts = {}) {
	// Build the character lookup table:
	if (!encoding.codes) {
		encoding.codes = {}
		for (let i = 0; i < encoding.chars.length; ++i) {
			encoding.codes[encoding.chars[i]] = i
		}
	}

	// The string must have a whole number of bytes:
	if (!opts.loose && (string.length * encoding.bits) & 7) {
		throw new SyntaxError('Invalid padding')
	}

	// Count the padding bytes:
	let end = string.length
	while (string[end - 1] === '=') {
		--end

		// If we get a whole number of bytes, there is too much padding:
		if (!opts.loose && !(((string.length - end) * encoding.bits) & 7)) {
			throw new SyntaxError('Invalid padding')
		}
	}

	// Allocate the output:
	const out = new (opts.out ?? Uint8Array)(
		((end * encoding.bits) / 8) | 0
	)

	// Parse the data:
	let bits = 0 // Number of bits currently in the buffer
	let buffer = 0 // Bits waiting to be written out, MSB first
	let written = 0 // Next byte to write
	for (let i = 0; i < end; ++i) {
		// Read one character from the string:
		const value = encoding.codes[string[i]]
		if (value === undefined) {
			throw new SyntaxError('Invalid character ' + string[i])
		}

		// Append the bits to the buffer:
		buffer = (buffer << encoding.bits) | value
		bits += encoding.bits

		// Write out some bits if the buffer has a byte's worth:
		if (bits >= 8) {
			bits -= 8
			out[written++] = 0xff & (buffer >> bits)
		}
	}

	// Verify that we have received just enough bits:
	if (bits >= encoding.bits || 0xff & (buffer << (8 - bits))) {
		throw new SyntaxError('Unexpected end of data')
	}

	return out.buffer;
}
/* END rfc4648.js */


const BINARY = parse(`AGFzbQEAAAABPgpgA39/fwF/YAJ/fwF/YAF/AGABfwF/YAABf2AFf39/f38AYAAAYAZ/f39/f38A
YAR/f39/AX9gBH9/f38AAx0cBgQCAgEBAAEDAQAAAAAABwUFCAkEAwIDAQQCAwQFAXABBgYFBgEB
gAKAAgYJAX8BQeCOwAILB9kBDwZtZW1vcnkCAAhmdmFkX25ldwABBm1hbGxvYwAVCmZ2YWRfcmVz
ZXQAAglmdmFkX2ZyZWUAAwRmcmVlABYNZnZhZF9zZXRfbW9kZQAEFGZ2YWRfc2V0X3NhbXBsZV9y
YXRlAAUMZnZhZF9wcm9jZXNzAAYZX19pbmRpcmVjdF9mdW5jdGlvbl90YWJsZQEAC19pbml0aWFs
aXplAAAQX19lcnJub19sb2NhdGlvbgAUCXN0YWNrU2F2ZQAZDHN0YWNrUmVzdG9yZQAaCnN0YWNr
QWxsb2MAGwkLAQBBAQsFCw0MCgAKiXIcAwABCxQBAX9B5AUQFSIABEAgABACCyAAC6ACAQR/AkAg
AEUNACAAQgA3AgQgAEEBNgIAIABCADcClAIgAEIANwIMIABBFGpBoAEQGBoDfyADQQxGBH8DQCAB
QeAARwRAIAAgAUEBdGoiAkEAOwGcAiACQZDOADsB3AMgAUEBaiEBDAELCyAAQgA3AqgFQQAhASAA
QQA2AsAFIABCADcCuAUgAEIANwKwBQNAIAFBBkcEQCAAIAFBAXRqQcAMOwGcBSABQQFqIQEMAQsL
IABBABAJDQIgAEEqNgLcBUEABSAAIANBAXQiAmoiBCACQZAJai8BADsB/AEgBCACQfAIai8BADsB
5AEgBCACQdAIai8BADsBzAEgBCACQbAIai8BADsBtAEgA0EBaiEDDAELCxoLIABBADYC4AULBgAg
ABAWCwgAIAAgARAJC0QBAX8DQAJAIAJBBEcEQCACQQJ0QYAIaigCAEHoB2wgAUcNASAAIAI2AuAF
C0F/QQAgAkEDSxsPCyACQQFqIQIMAAsAC20BBH8CfyAAKALgBSIFQQJ0QYAIaigCACEGA0AgBCID
QQNHBEAgA0EBaiEEIANBAnRBoAhqKAIAIAZsIAJHDQELCyADQQNJCwR/IAAgASACIAVBAnRBkAhq
KAIAEQAAIgBBASAAQQFIGwVBfwsLFAAgAUUEQEH/////Bw8LIAAgAW0LGQAgAEEfdSAAc2dBAWtB
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`.replace(/\n/g, ""));


import builder, { VADMode, VADEvent, FRAME_SIZE } from "./vad.js"


export default async function() {
	return builder(BINARY);
}

export { VADMode, VADEvent, FRAME_SIZE };

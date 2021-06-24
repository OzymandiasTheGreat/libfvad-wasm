# libfvad-wasm

I had a need for a VAD library that would run on Android via NativeScript.
Compatibility with browsers and Node would've been a bonus.
After looking around for a bit I realized that my best bet would be to use
VAD library extracted from WebRTC project compiled to WASM.

This would run on Android through NativeScript, and in browsers and recent versions
of Node natively. The only downside I could think of, was no iOS support, since WASM
isn't allowed in apps by Apple.

I first discovered Mozilla-owned repository that contained wetrtc_vad code extracted
and compiled with Emscripten. That was a great starting point, although ultimately
not viable since it contained too much unnecessary C code and the whole repository
seems abandoned.

Then, in my search, I found libfvad. This project is fairly active, contains no unnecessary code,
and even packages VAD in easy-to-consume API. So I decided to go with this and package it with
Emscripten so it can be ran anywhere.

So here we are. On to the API reference.

## API Reference

This package is an ES module. To use it with older browsers you'll need Babel or some such.
To use it with Node, you'll need a version with support for ES modules and WASM.
To use it with NativeScript, you shouldn't need anything extra, as {N} imports embedded version
by default.
There are also typings provided.

The main default export is an async function that resolve to class constructor VAD.
There are also to named exports VADMode and VADEvent;

VADMode defines the aggressiveness of vad. Higher mode means less false positives and
potentially more missed utterances. The available modes are:

- NORMAL
- LOW_BITRATE (optimized for low bitrate streams)
- AGGRESSIVE (this seems to work best in most situations)
- VERY_AGGRESSIVE

VADEvent is an enum with these members `{ ERROR, SILENCE, VOICE }`;

```typescript
VAD(mode: VADMode, rate: number);

// Convenience function for browsers, as AudioWorklet returns data as Float32Array
// which is incompatible with this library
static VAD.floatTo16BitPCM(buffer: Float32Array): Int16Array;

// Single frame processing, used internally. Not very useful on it's own
VAD.processFrame(frame: Int16Array): VADEvent;

// Buffer processing, larger buffers return more accurate results
VAD.processBuffer(buffer: Buffer | ArrayBufferView): VADEvent;

// Free the resources used by this instance. Instance is not usable afterwards
VAD.destroy(): void;
```

You can also find the C api as exported by `dist/libfvad.wasm` in `include/fvad.h`.

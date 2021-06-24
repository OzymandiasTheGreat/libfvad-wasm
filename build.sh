emcc \
	-s WASM=1 \
	-s STANDALONE_WASM=1 \
	--no-entry \
	-Oz \
	-D NDEBUG \
	-I ./include \
	./src/fvad.c \
	./src/signal_processing/*.c \
	./src/vad/*.c \
	-s EXPORTED_FUNCTIONS="['_fvad_new', '_fvad_free', '_fvad_reset', '_fvad_set_mode', '_fvad_set_sample_rate', '_fvad_process', '_malloc', '_free']" \
	-o ./dist/libfvad.wasm
base64 ./dist/libfvad.wasm > base64.txt

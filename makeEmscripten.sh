#!/bin/sh
emcc ./api68/api68.c ./api68/conf68.c ./api68/mixer68.c ./emu68/cc68.c ./emu68/emu68.c ./emu68/error68.c ./emu68/getea68.c ./emu68/inst68.c  ./emu68/ioplug68.c ./emu68/mem68.c ./emu68/line0_68.c ./emu68/line1_68.c ./emu68/line2_68.c ./emu68/line3_68.c ./emu68/line4_68.c ./emu68/line5_68.c ./emu68/line6_68.c ./emu68/line7_68.c ./emu68/line8_68.c ./emu68/line9_68.c ./emu68/lineA_68.c ./emu68/lineB_68.c ./emu68/lineC_68.c ./emu68/lineD_68.c ./emu68/lineE_68.c ./emu68/lineF_68.c ./emu68/table68.c ./file68/alloc68.c ./file68/debugmsg68.c  ./file68/endian68.c  ./file68/error68.c ./file68/file68.c ./file68/gzip68.c ./file68/ice68.c ./file68/istream68.c ./file68/istream68_fd.c ./file68/istream68_file.c  ./file68/istream68_mem.c ./file68/string68.c ./io68/mfp_io.c ./io68/mfpemul.c ./io68/mw_io.c ./io68/mwemul.c ./io68/paula_io.c ./io68/paulaemul.c ./io68/shifter_io.c ./io68/ym_io.c ./io68/ymemul.c ./unice68/unice68_native.c ./sc68/sc68.c \
    adapter.c \
    -s WASM=1 \
    -s VERBOSE=0 \
    -s ASSERTIONS=0 \
    -s FORCE_FILESYSTEM=1  \
    --js-library callback.js \
    -Wno-error=incompatible-function-pointer-types \
    -Wno-error=undefined \
    -DONDEMAND \
    -Wno-pointer-sign \
    -I ./ \
    -Os \
    -O3 \
    --closure 1 \
    -s EXPORTED_RUNTIME_METHODS="['ccall', 'UTF8ToString']" \
    -s EXPORTED_FUNCTIONS="['_malloc', '_free', '_emu_init', '_emu_get_current_position', '_emu_seek_position', '_emu_get_max_position', '_emu_set_binary_data', '_emu_change_subsong', '_emu_get_audio_buffer_length', '_emu_get_audio_buffer', '_emu_compute_audio_samples', '_emu_is_error', '_emu_is_waiting', '_emu_is_track_change', '_emu_is_end', '_emu_is_loop', '_emu_get_track_info', '_emu_get_sample_rate']" \
    -o dist/sc68_worklet_processor.js   \
    -s SINGLE_FILE=1  \
    -s BINARYEN_ASYNC_COMPILATION=0  \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s ENVIRONMENT=worker \
    -s MODULARIZE=1 \
    -s EXPORT_NAME=backend_SC68 \
    -s "BINARYEN_METHOD='native-wasm'" \
    --extern-pre-js pre.js \
    --extern-post-js post.js

cat sc68_worklet_adapter.js >> dist/sc68_worklet_processor.js

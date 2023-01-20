/*
 sc68_worklet_adapter.js: Adapts SC68 backend to workletAudioProcessor API

 version 1.0

 	Copyright (C) 2015 Juergen Wothke

version 2.0

    Copyright (C) 2015 Juergen Wothke

 LICENSE

 This library is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2.1 of the License, or (at
 your option) any later version. This library is distributed in the hope
 that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA
*/


class AudioBackendAdapterBase {

    constructor(channels, bytesPerSample) {

        this.resampleBuffer = new Float32Array();
        this.channels = channels;
        this.bytesPerSample = bytesPerSample;
        this.sampleRate = 44100;
        this.inputSampleRate = 44100;
        this.observer;
        this.manualSetupComplete = true;  // override if necessary

    }


    // ************* core functions that must be defined by a subclass

    /**
    * Fills the audio buffer with the next batch of samples
    * Return 0: OK, -1: temp issue - waiting for file, 1: end, 2: error
    */
    computeAudioSamples() { this.error("computeAudioSamples"); }

    /**
    * Load the song's binary data into the backend as a first step towards playback.
    * The subclass can either use the 'data' directly or us the 'filename' to retrieve it indirectly
    * (e.g. when regular file I/O APIs are used).
    */
    loadMusicData(sampleRate, path, filename, data, options) { this.error("loadMusicData"); }

    /**
    * Second step towards playback: Select specific sub-song from the loaded song file.
    * Allows to select a specific sub-song and/or apply additional song setting..
    */
    evalTrackOptions(options) { this.error("evalTrackOptions"); }

    /**
    * Get info about currently selected music file and track. Respective info very much depends on
    * the specific backend - use getSongInfoMeta() to check for available attributes.
    */
    updateSongInfo(filename, result) { this.error("updateSongInfo"); }

    /**
    * Advertises the song attributes that can be provided by this backend.
    */
    getSongInfoMeta() { this.error("getSongInfoMeta"); }


    // ************* sample buffer and format related

    /**
    * Return: pointer to memory buffer that contains the sample data
    */
    getAudioBuffer() { this.error("getAudioBuffer"); }

    /**
    * Return: length of the audio buffer in 'ticks' (e.g. mono buffer with 1 8-bit
    *         sample= 1; stereo buffer with 1 32-bit * sample for each channel also= 1)
    */
    getAudioBufferLength() { this.error("getAudioBufferLength"); }

    /**
    * Reads one audio sample from the specified position.
    * Return sample value in range: -1..1
    */
    readFloatSample(buffer, idx) { this.error("readFloatSample"); }

    /**
    * @param pan 0..2 (1 creates mono)
    */
    applyPanning(buffer, len, pan) { this.error("applyPanning"); }

    /**
    * Return size one sample in bytes
    */
    getBytesPerSample() {
        return this.bytesPerSample;
    }

    /**
    * Number of channels, i.e. 1= mono, 2= stereo
    */
    getChannels() {
        return this.channels;
    }

    /*
    * Creates the URL used to retrieve the song file.
    */
    mapInternalFilename(overridePath, defaultPath, uri) {
        return ((overridePath) ? overridePath : defaultPath) + uri;  // this.basePath ever needed?
    }
    /*
    * Allows to map the filenames used in the emulation to external URLs.
    */
    mapUrl(filename) {
        return filename;
    }

    /*
    * Allows to perform some file input based manual setup sequence (e.g. setting some BIOS).
    * return 0: step successful & init completed, -1: error, 1: step successful
    */
    uploadFile(filename, options) {
        return 0;
    }

    /*
    * Check if this AudioBackendAdapterBase still needs manually performed
    * setup steps (see uploadFile())
    */
    isManualSetupComplete() {
        return this.manualSetupComplete;
    }

    /**
    * Cleanup backend before playing next music file
    */
    teardown() { this.error("teardown"); }

    // ************* optional: song "position seek" functionality (only available in backend)

    /**
    * Return: default 0 = seeking not supported
    */
    getMaxPlaybackPosition() { return 0; }

    /**
    * Return: default 0
    */
    getPlaybackPosition() { return 0; }

    /**
    * Move playback to 'pos': must be between 0 and getMaxPlaybackPosition()
    * Return: 0 if successful
    */
    seekPlaybackPosition(pos) { return -1; }

    // ************* optional: async file-loading related (only if needed)

    /**
    * Transform input filename into path/filename expected by the backend
    * Return array with 2 elements: 0: basePath (backend specific - most don't need one),
    *        1: filename (incl. the remainder of the path)
    */
    getPathAndFilename(filename) { this.error("getPathAndFilename"); }

    /**
    * Let backend store a loaded file in such a way that it can later deal with it.
    * Return a filehandle meaningful to the used backend
    */
    registerFileData(pathFilenameArray, data) { this.error("registerFileData"); }

    // if filename/path used by backend does not match the one used by the browser
    mapBackendFilename(name) { return name; }

    // introduced for backward-compatibility..
    mapCacheFileName(name) { return name; }
    /*
    * Backend may "push" update of song attributes (like author, copyright, etc)
    */
    handleBackendSongAttributes(backendAttr, target) { this.error("handleBackendSongAttributes"); }


    // ************* built-in utility functions
    mapUri2Fs(uri) {    // use extended ASCII that most likely isn't used in filenames
        // replace chars that cannot be used in file/foldernames
        let out = uri.replace(/\/\//, "Ã½Ã½");
        out = out.replace(/\?/, "Ã¿");
        out = out.replace(/:/, "Ã¾");
        out = out.replace(/\*/, "Ã¼");
        out = out.replace(/"/, "Ã»");
        out = out.replace(/</, "Ã¹");
        out = out.replace(/>/, "Ã¸");
        out = out.replace(/\|/, "Ã·");
        return out;
    }
    mapFs2Uri(fs) {
        let out = fs.replace(/Ã½Ã½/, "//");
        out = out.replace(/Ã¿/, "?");
        out = out.replace(/Ã¾/, ":");
        out = out.replace(/Ã¼/, "*");
        out = out.replace(/Ã»/, "\"");
        out = out.replace(/Ã¹/, "<");
        out = out.replace(/Ã¸/, ">");
        out = out.replace(/Ã·/, "|");
        return out;
    }


    error(name) {
        console.log("fatal error: abstract method '" + name + "' must be defined");
    }

    resetSampleRate(sampleRate, inputSampleRate) {
        if (sampleRate > 0) { this.sampleRate = sampleRate; }
        if (inputSampleRate > 0) { this.inputSampleRate = inputSampleRate; }

        const s = Math.round(SAMPLES_PER_BUFFER * this.sampleRate / this.inputSampleRate) * this.getChannels();

        if (s > this.resampleBuffer.length) {
            this.resampleBuffer = this.allocResampleBuffer(s);
        }
    }

    allocResampleBuffer(s) {
        return new Float32Array(s);
    }

    getCopiedAudio(input, len, funcReadFloat, resampleOutput) {
        // just copy the rescaled values so there is no need for special handling in playback loop
        for (let i = 0; i < len * this.channels; i++) {
            resampleOutput[i] = funcReadFloat(input, i * 2);
        }
        //console.log(resampleOutput)
        return len;
    }

    getResampledAudio(input, len) {
        return this.getResampledFloats(input, len, this.sampleRate, this.inputSampleRate);
    }

    getResampledFloats(input, len, sampleRate, inputSampleRate) {

        let resampleLen;
        if (sampleRate == inputSampleRate) {
            resampleLen = this.getCopiedAudio(input, len, this.readFloatSample.bind(this), this.resampleBuffer);
        } else {
            resampleLen = Math.round(len * sampleRate / inputSampleRate);
            const bufSize = resampleLen * this.channels;  // for each of the x channels

            if (bufSize > this.resampleBuffer.length) { this.resampleBuffer = this.allocResampleBuffer(bufSize); }

            // only mono and interleaved stereo data is currently implemented..
            this.resampleToFloat(this.channels, 0, input, len, this.readFloatSample.bind(this), this.resampleBuffer, resampleLen);
            if (this.channels == 2) {
                this.resampleToFloat(this.channels, 1, input, len, this.readFloatSample.bind(this), this.resampleBuffer, resampleLen);
            }
        }
        return resampleLen;
    }

    // utility
    resampleToFloat(channels, channelId, inputPtr, len, funcReadFloat, resampleOutput, resampleLen) {
        // Bresenham (line drawing) algorithm based resampling
        const x0 = 0;
        const y0 = 0;
        const x1 = resampleLen - 0;
        const y1 = len - 0;

        const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
        const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        const err = dx + dy;
        let e2;

        let i;
        for (; ;) {
            i = (x0 * channels) + channelId;
            resampleOutput[i] = funcReadFloat(inputPtr, (y0 * channels) + channelId);

            if (x0 >= x1 && y0 >= y1) { break; }
            e2 = 2 * err;
            if (e2 > dy) { err += dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    getResampleBuffer() {
        return this.resampleBuffer;
    }

}


/*
* Emscripten based backends that produce 16-bit sample data.
*
*/
class EmsHEAP16BackendAdapter extends AudioBackendAdapterBase {

    constructor(backend, channels) {
        super(channels, 2)
        this.Module = backend;
    }

    readFloatSample(buffer, idx) {
        return (this.Module.HEAP16[buffer + idx]) / 0x8000;
    }

    // certain songs use an unfavorable L/R separation - e.g. bass on one channel - that is
    // not nice to listen to. This "panning" impl allows to "mono"-ify those songs.. (this.pan=1
    // creates mono)
    applyPanning(buffer, len, pan) {
        pan = pan * 256.0 / 2.0;

        for (let i = 0; i < len * 2; i += 2) {
            const l = this.Module.HEAP16[buffer + i];
            const r = this.Module.HEAP16[buffer + i + 1];
            let m = (r - l) * pan;

            const nl = ((l << 8) + m) >> 8;
            const nr = ((r << 8) - m) >> 8;
            this.Module.HEAP16[buffer + i] = nl;
            this.Module.HEAP16[buffer + i + 1] = nr;
        }
    }

}

const SAMPLES_PER_BUFFER = 1024; //1024

const backend_module = backend_SC68();

let sc68BackendInitOnce = false;	// must be global (otherwise reinit of backend may fail)

class SC68BackendAdapter extends EmsHEAP16BackendAdapter {

    constructor() {
        super(backend_module, 2);
        this.currentTrack;
        this.replayCache = {}
        this.songInfo = {}
        this.worklet = null
    }

    loadMusicData(sampleRate, data, options) {
        // load the song's binary data
        const buf = this.Module._malloc(data.length);
        this.Module.HEAPU8.set(data, buf);

        let timeout = -1;	// means: keep built-in timeout
        if ((typeof options != 'undefined') && typeof options.timeout != 'undefined') {
            timeout = options.timeout * 1000;
        }
        const ret = this.Module.ccall('emu_init', 'number',
            ['number', 'number', 'number', 'number', 'number'],
            [sc68BackendInitOnce, sampleRate, timeout, buf, data.length]);

        sc68BackendInitOnce = true;
        this.Module._free(buf);

        if (ret == 0) {
            const inputSampleRate = this.Module.ccall('emu_get_sample_rate', 'number');
            this.resetSampleRate(sampleRate, inputSampleRate);
        }
        console.log('loadMusicData ret=' + ret)
        return ret;
    }

    evalTrackOptions(options) {
        if (typeof options.timeout != 'undefined') {
            // FIXME quite redundant - since sc68 also has a timeout.. (see above)
            // ScriptNodePlayer.getInstance().setPlaybackTimeout(options.timeout * 1000);
        }
        const track = options.track ? options.track : 0;	// frontend counts from 0
        this.currentTrack = track + 1;					// sc68 starts counting at 1

        // for sc68 "0" means "all"..
        const ret = this.Module.ccall('emu_change_subsong', 'number', ['number'], [this.currentTrack]);

        // it seems that the above doesn't work and that manual seeking has to be used instead..
        if (this.currentTrack > 1) {
            let o = new Object();
            let seek = 0;

            for (let i = 1; i < this.currentTrack; i++) {
                seek += this.getSongLength(i);
            }

            // hack; seeking doesnt seem to work before emu_compute_audio_samples is called
            this.Module.ccall('emu_compute_audio_samples', 'number');
            this.seekPlaybackPosition(seek);
        }

        return ret;
    }

    getSongLength(track) {
        const numAttr = 7;
        const ret = this.Module.ccall('emu_get_track_info', 'number', ['number'], [track]);
        const array = this.Module.HEAP32.subarray(ret >> 2, (ret >> 2) + numAttr);
        return parseInt(this.Module.UTF8ToString(array[5]));
    }

    seekPlaybackPosition(pos) {
        return this.Module.ccall('emu_seek_position', 'number', ['number'], [pos]);
    }

    getAudioBuffer() {
        const ptr = this.Module.ccall('emu_get_audio_buffer', 'number');
        // make it a this.Module.HEAP16 pointer
        return ptr >> 1;	// 2 x 16 bit samples
    }

    getAudioBufferLength() {
        return this.Module.ccall('emu_get_audio_buffer_length', 'number');
    }

    computeAudioSamples() {

        const status = this.Module.ccall('emu_compute_audio_samples', 'number');

        const isError = this.Module.ccall('emu_is_error', 'number', ['number'], [status]);

        if (isError) {
            return -1;
        } else {
            const isWaiting = this.Module.ccall('emu_is_waiting', 'number', ['number'], [status]);

            if (isWaiting) {
                // eventually the "replay" will be loaded and normal
                // processing will resume
                //ScriptNodePlayer.getInstance().setWait(true);
                return -1;
            } else {
                if (this.Module.ccall('emu_is_track_change', 'number', ['number'], [status])) {
                    console.log('emu_is_track_change')
                    return 0;
                }
                else if (this.Module.ccall('emu_is_loop', 'number', ['number'], [status])) {
                    console.log('emu_is_loop')
                    return 1;
                }
                else if (this.Module.ccall('emu_is_end', 'number', ['number'], [status])) {
                    console.log('emu_is_end')
                    return 1;
                }
                return 0;
            }
        }
    }

    getMaxPlaybackPosition() {
        return this.Module.ccall('emu_get_max_position', 'number');
    }

    getPlaybackPosition() {
        return this.Module.ccall('emu_get_current_position', 'number');
    }

    updateSongInfo() {
        const numAttr = 7;
        const ret = this.Module.ccall('emu_get_track_info', 'number', ['number'], [this.currentTrack]);

        const array = this.Module.HEAP32.subarray(ret >> 2, (ret >> 2) + numAttr);

        this.songInfo.title = this.Module.UTF8ToString(array[0]);
        this.songInfo.author = this.Module.UTF8ToString(array[1]);
        this.songInfo.composer = this.Module.UTF8ToString(array[2]);
        this.songInfo.replay = this.Module.UTF8ToString(array[3]);
        this.songInfo.hwname = this.Module.UTF8ToString(array[4]);
        this.songInfo.songInMillis = parseInt(this.Module.UTF8ToString(array[5]));
        this.songInfo.numberOfTracks = parseInt(this.Module.UTF8ToString(array[6]));

        return this.songInfo
    }


    isStereo() {
        return this.getChannels() == 2;
    }

    mapBackendFilename(name) {
        return this.Module.UTF8ToString(name);
    }

    fileRequestCallback(name) {
        const fullFilename = this.mapBackendFilename(name);

        const ret = this.loadReplay(fullFilename)

        if (ret != 0) {
            this.worklet.port.postMessage({
                type: 'fileRequestCallback',
                fullFilename: fullFilename
            });
        }
        return ret
    }

    loadReplay(name) {
        if (name in this.replayCache) {
            const byteArray = this.replayCache[name];
            console.log('loading Replay ' + name)
            const bytes = new Uint8Array(name.length + 1);	// we dont have any unicode here

            let i
            for (i = 0; i < name.length; i++) {
                bytes[i] = name.charCodeAt(i) & 0xff;
            }

            bytes[i] = 0;
            const keybuf = this.Module._malloc(bytes.length);
            this.Module.HEAPU8.set(bytes, keybuf);
            const buf = this.Module._malloc(byteArray.length);
            this.Module.HEAPU8.set(byteArray, buf);
            const ret = this.Module.ccall('emu_set_binary_data', 'number', ['number', 'number', 'number', 'number'], [keybuf, bytes.length, buf, byteArray.length]);
            console.log('emu_set_binary_data status=' + ret)
            this.Module._free(keybuf);
            this.Module._free(buf);

            return 0
        } else {
            return -1
        }
    }

    registerFileData(name, byteArray) {
        this.replayCache[name] = byteArray

        this.worklet.port.postMessage({
            type: 'retryPrepareTrackForPlayback'
        });
    }
}

const backendAdapter = new SC68BackendAdapter()

const window = {
    fileRequestCallback: function (name) {
        return backendAdapter.fileRequestCallback(name)
    }
}


class SC68WorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.backendAdapter = backendAdapter
        this.backendAdapter.worklet = this

        // this.traceSwitch = false;

        this.spectrumEnabled = false

        // // container for song infos like: name, author, etc
        this.songInfo = {};

        this.silenceStarttime = -1;
        this.silenceTimeout = 5; // by default 5 secs of silence will end a song

        // // audio buffer handling
        this.sourceBuffer;
        this.sourceBufferLen;
        this.numberOfSamplesRendered = 0;
        this.numberOfSamplesToRender = 0;
        this.sourceBufferIdx = 0;

        // // additional timeout based "song end" handling
        this.currentPlaytime = 0;
        this.currentTimeout = -1;

        this.pan = null;  // default: inactive

        // // --------------- player status stuff ----------

        this.isPaused = true;          // 'end' of a song also triggers this state

        // // setup asyc completion of initialization
        this.isPlayerReady = false;    // this state means that the player is initialized and can be used now
        this.isSongReady = false;    // initialized (including file-loads that might have been necessary)
        this.initInProgress = false;


        this.port.onmessage = this.onmessage.bind(this);

    }

    onmessage(e) {
        const { data } = e;
        console.log('onmessage ' + data.type)
        switch (data.type) {

            case 'loadMusicData':
                this.isSongReady = (this.backendAdapter.loadMusicData(data.sampleRate, data.data, data.options) == 0)
                break;

            case 'evalTrackOptions':
                this.backendAdapter.evalTrackOptions(data.options);
                break;

            case 'updateSongInfo':
                const songInfo = this.backendAdapter.updateSongInfo();
                this.port.postMessage({
                    type: 'songInfoUpdated',
                    songInfo: songInfo
                });
                break;

            case 'resetSampleRate':
                this.backendAdapter.resetSampleRate(data.sampleRate, -1);
                break;

            case 'play':
                this.isPaused = false;
                break;

            case 'pause':
                this.isPaused = true;
                break;

            case 'registerFileData':
                this.backendAdapter.registerFileData(data.name, data.payload)
                break;

            case 'setTrack':
                this.backendAdapter.evalTrackOptions({track: data.track})
                break;

        }
    }

    isStereo() {
        return this.backendAdapter.getChannels() == 2;
    }

    copySamplesMono(resampleBuffer, output1, outSize) {

        let s = 0,
            o = 0;

        if (this.numberOfSamplesRendered + this.numberOfSamplesToRender > outSize) {
            const availableSpace = outSize - this.numberOfSamplesRendered;

            for (let i = 0; i < availableSpace; i++) {
                const ii = i + this.numberOfSamplesRendered;

                o = resampleBuffer[this.sourceBufferIdx++];
                output1[ii] = o;

                s += Math.abs(o);
            }
            this.numberOfSamplesToRender -= availableSpace;
            this.numberOfSamplesRendered = outSize;
        } else {

            for (let i = 0; i < this.numberOfSamplesToRender; i++) {
                const ii = i + this.numberOfSamplesRendered;

                o = resampleBuffer[this.sourceBufferIdx++];
                output1[ii] = o;

                s += Math.abs(o);
            }
            this.numberOfSamplesRendered += this.numberOfSamplesToRender;
            this.numberOfSamplesToRender = 0;
        }
        this.detectSilence(s);
    }

    copySamplesStereo(resampleBuffer, output1, output2, outSize) {
        let s = 0;

        if (this.numberOfSamplesRendered + this.numberOfSamplesToRender > outSize) {
            const availableSpace = outSize - this.numberOfSamplesRendered;

            for (let i = 0; i < availableSpace; i++) {
                const ii = i + this.numberOfSamplesRendered;

                const l = resampleBuffer[this.sourceBufferIdx++];
                const r = resampleBuffer[this.sourceBufferIdx++];

                output1[ii] = l;
                output2[ii] = r;

                s += Math.abs(l) + Math.abs(r);
            }

            this.numberOfSamplesToRender -= availableSpace;
            this.numberOfSamplesRendered = outSize;
        } else {
            for (let i = 0; i < this.numberOfSamplesToRender; i++) {
                const ii = i + this.numberOfSamplesRendered;

                const l = resampleBuffer[this.sourceBufferIdx++];
                const r = resampleBuffer[this.sourceBufferIdx++];

                output1[ii] = l;
                output2[ii] = r;

                s += Math.abs(l) + Math.abs(r);
            }
            this.numberOfSamplesRendered += this.numberOfSamplesToRender;
            this.numberOfSamplesToRender = 0;
        }
        this.detectSilence(s);
    }

    detectSilence(s) {
        if (this.silenceStarttime == 0) {	// i.e. song has been playing
            if (s == 0) {	// silence detected
                this.silenceStarttime = this.currentPlaytime;
            }
        } else if (s > 0) {	// i.e. false alarm or very start of playback
            this.silenceStarttime = 0;
        }
    }

    fillEmpty(outSize, output1, output2) {
        const availableSpace = outSize - this.numberOfSamplesRendered;

        for (let i = 0; i < availableSpace; i++) {
            output1[i + this.numberOfSamplesRendered] = 0;
            if (typeof output2 !== 'undefined') { output2[i + this.numberOfSamplesRendered] = 0; }
        }
        this.numberOfSamplesToRender = 0;
        this.numberOfSamplesRendered = outSize;
    }

    process(inputs, outputs) {

        const genStereo = this.isStereo() && outputs[0].numberOfChannels > 1;

        const output1 = outputs[0][0];
        const output2 = outputs[0][1];

        if ((!this.isSongReady) || this.isPaused) {
            for (let i = 0; i < output1.length; i++) {
                output1[i] = 0;
                if (genStereo) { output2[i] = 0; }
            }
        } else {

            const outSize = output1.length;

            this.numberOfSamplesRendered = 0;

            while (this.numberOfSamplesRendered < outSize) {
                if (this.numberOfSamplesToRender === 0) {
                    let status;
                    if ((this.currentTimeout > 0) && (this.currentPlaytime > this.currentTimeout)) {
                        console.log("'song end' forced after " + this.currentTimeout / this.correctSampleRate + " secs");
                        status = 1;
                    } else {
                        status = this.backendAdapter.computeAudioSamples()
                    }

                    if (status !== 0) {
                        // no frame left
                        this.fillEmpty(outSize, output1, output2);

                        if (status < 0) {
                            console.log('stuck by file-load')
                            // file-load: emu just discovered that we need to load another file
                            // this.isPaused = true;
                            this.isSongReady = false;     // previous init is invalid
                            return true; // complete init sequence must be repeated
                        } else {
                            if (status > 1) {
                                this.trace("playback aborted with an error");
                            }

                            this.isPaused = true;  // stop playback (or this will retrigger again and again before new song is started)
                            this.port.postMessage({
                                type: 'onTrackEnd'
                            });
                            return;
                        }
                    }
                    // refresh just in case they are not using one fixed buffer..
                    this.sourceBuffer = this.backendAdapter.getAudioBuffer();
                    this.sourceBufferLen = this.backendAdapter.getAudioBufferLength();

                    if (this.pan != null)
                    this.backendAdapter.applyPanning(this.sourceBuffer, this.sourceBufferLen, this.pan + 1.0);

                    this.numberOfSamplesToRender = this.backendAdapter.getResampledAudio(this.sourceBuffer, this.sourceBufferLen);

                    this.sourceBufferIdx = 0;
                }

                const resampleBuffer = this.backendAdapter.getResampleBuffer();

                if (genStereo) {
                    this.copySamplesStereo(resampleBuffer, output1, output2, outSize);
                } else {
                    this.copySamplesMono(resampleBuffer, output1, outSize);
                }
            }
            // keep track how long we are playing: just filled one WebAudio buffer which will be played at
            this.currentPlaytime += outSize * this.correctSampleRate / this.sampleRate;

            // silence detection at end of song
            if ((this.silenceStarttime > 0) && ((this.currentPlaytime - this.silenceStarttime) >= this.silenceTimeout * this.correctSampleRate) && (this.silenceTimeout > 0)) {
                this.isPaused = true;  // stop playback (or this will retrigger again and again before new song is started)
                this.port.postMessage({
                    type: 'onTrackEnd'
                });
            }
        }
        return true
    }
}


registerProcessor('sc68-worklet-processor', SC68WorkletProcessor);

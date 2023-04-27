let wasm;

let cachedTextDecoder;

// cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

let WASM_VECTOR_LEN = 0;

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4);
    getFloat32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
*/
export class OvertonalOsc {

    static __wrap(ptr) {
        const obj = Object.create(OvertonalOsc.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_overtonalosc_free(ptr);
    }
    /**
    * @param {number} sample_rate
    * @param {Float32Array} overtones
    * @returns {OvertonalOsc}
    */
    static new(sample_rate, overtones) {
        const ptr0 = passArrayF32ToWasm0(overtones, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.overtonalosc_new(sample_rate, ptr0, len0);
        return OvertonalOsc.__wrap(ret);
    }
    /**
    * @param {number} pitch
    * @param {number} gain
    * @returns {number}
    */
    sample(pitch, gain) {
        const ret = wasm.overtonalosc_sample(this.ptr, pitch, gain);
        return ret;
    }
}
/**
*/
export class SineOsc {

    static __wrap(ptr) {
        const obj = Object.create(SineOsc.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sineosc_free(ptr);
    }
    /**
    * @param {number} pitch
    * @param {number} gain
    * @returns {number}
    */
    sample(pitch, gain) {
        const ret = wasm.sineosc_sample(this.ptr, pitch, gain);
        return ret;
    }
    /**
    * @param {number} sample_rate
    * @returns {SineOsc}
    */
    static new(sample_rate) {
        const ret = wasm.sineosc_new(sample_rate);
        return SineOsc.__wrap(ret);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function initMemory(imports, maybe_memory) {

}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedFloat32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    const imports = getImports();

    initMemory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('wasm_demo_bg.wasm', import.meta.url);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}



class WebSynthProcessor extends AudioWorkletProcessor {


    constructor(options) {
        super(options);
        this.cycler = 0;
        this.transport = 0;

        this.port.onmessage = event => this.onmessage(event.data);
        console.log(sampleRate);

        this.osc = null;
    }

    onmessage(data) {
        if (data.type === 'init-wasm') {
            const instance = async () => {
                try {
                    // const imports = getImports();
                    console.log("instantiating wasm");
                    console.log('this:', this);
                    cachedTextDecoder = data.decoder;
                    // let mod = await WebAssembly.instantiate(data.wasmData, {});
                    let mod = await load(data.wasmData, getImports());
                    this._wasm = mod;
                    finalizeInit(mod.instance, mod.module);
                    console.log('wasm instance', wasm);

                    // for (let i = 0; i < sampleRate; i++) {
                    //     let s = this._wasm.exports.samplex(440, 0.3, sampleRate, i);
                    //     console.log('sample', s);
                    // }
                    this.osc = OvertonalOsc.new(sampleRate, [0.5, 0.25, 0.125, 0.12, 0.11, 0.01]);
                } catch(e) {
                    console.log("Caught error in instantiating wasm", e);
                }
            }
            console.log('received init');
            
            instance();
        }
    }

    process(inputs, outputs, parameters) {

        if (typeof this.osc !== 'undefined' && this.osc !== null) {
            let output = outputs[0];

            output.forEach(channel => {
                for (let i = 0; i < channel.length; i++) {
                    let pitch = 880;
                    // let sample = this._wasm.exports.samplex(pitch, 0.3, sampleRate, this.transport);
                    let sample = this.osc.sample(440, 0.3);

                    // console.log('sample:', sample);

                    channel[i] = sample;

                    this.cycler += 1;
                    this.transport += 1;

                    let resetPoint = Math.ceil(sampleRate / pitch);

                    if (this.transport > this.resetPoint) {
                        this.transport = 0;
                    }

                    if (this.cycler > sampleRate) {
                        this.cycler = 0;
                    }
                }
            });

        } else {
            console.log('wasm not instantiated yet');
        }

        
        return true;
    }

} 

registerProcessor('web-synth-proto', WebSynthProcessor);
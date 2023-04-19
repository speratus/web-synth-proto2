// import init, {getImports} from "/pkg/wasm_demo.js";

let wasm;

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

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
    }

    onmessage(data) {
        if (data.type === 'init-wasm') {
            const instance = async () => {
                try {
                    // const imports = getImports();
                    console.log("instantiating wasm");
                    console.log('this:', this);
                    let mod = await WebAssembly.instantiate(data.wasmData, {});
                    this._wasm = mod;
                    console.log('wasm instance', this._wasm);

                    // for (let i = 0; i < sampleRate; i++) {
                    //     let s = this._wasm.exports.samplex(440, 0.3, sampleRate, i);
                    //     console.log('sample', s);
                    // }
                } catch(e) {
                    console.log("Caught error in instantiating wasm", e);
                }
            }
            console.log('received init');
            
            instance();
        }
    }

    process(inputs, outputs, parameters) {

        if (typeof this._wasm !== 'undefined' && this._wasm !== null) {
            let output = outputs[0];

            output.forEach(channel => {
                for (let i = 0; i < channel.length; i++) {
                    let pitch = 880;
                    let sample = this._wasm.exports.samplex(pitch, 0.3, sampleRate, this.transport);

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
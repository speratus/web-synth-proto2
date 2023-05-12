let wasm;

let cachedTextDecoder;

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

        this.port.onmessage = event => this.onmessage(event.data);

        this.osc = null;

        this.pitch = 440;
    }

    onmessage(data) {
        if (data.type === 'init-wasm') {
            const instance = async () => {
                try {
                    cachedTextDecoder = data.decoder;

                    let mod = await load(data.wasmData, getImports());
                    finalizeInit(mod.instance, mod.module);


                    this.osc = SineOsc.new(sampleRate);
                } catch(e) {
                    console.log("Caught error in instantiating wasm", e);
                }
            }
            console.log('received init');
            
            instance();
        } else if (data.type == 'freq-update') {
            this.pitch = data.freq;
        }
    }

    process(inputs, outputs, parameters) {

        if (typeof this.osc !== 'undefined' && this.osc !== null) {
            let output = outputs[0];

            output.forEach(channel => {
                for (let i = 0; i < channel.length; i++) {

                    let sample = this.osc.sample(this.pitch, 0.05);

                    channel[i] = sample;
                }
            });

        } else {
            console.log('wasm not instantiated yet');
        }

        
        return true;
    }

} 

registerProcessor('web-synth-proto', WebSynthProcessor);
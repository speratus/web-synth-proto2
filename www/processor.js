// import init, {getImports} from "/pkg/wasm_demo.js";

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
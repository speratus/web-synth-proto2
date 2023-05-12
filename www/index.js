let startBtn = document.getElementById('start-sound');

      async function setup() {
        const bin = await WebAssembly.compileStreaming(await fetch('/www/wasm_demo.wasm'));
        // const buf = await bin.arrayBuffer();

        let context =  new AudioContext();
        console.log("adding module");
        await context.audioWorklet.addModule('processor.js');
        let node = new AudioWorkletNode(context, 'web-synth-proto');
        node.port.postMessage({type: 'init-wasm', wasmData: bin});
        node.connect(context.destination);

        let freq = document.getElementById('frequency-input');

        freq.addEventListener('change', () => {
          node.port.postMessage({type: 'freq-update', freq: freq.value});
        });

        let stopBtn = document.getElementById('stop-sound');
        stopBtn.addEventListener('click', () => {
          context.close();
        });
      }

      startBtn.addEventListener('click', () => {
        setup();
      });
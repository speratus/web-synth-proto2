import { fetchWasm } from "wasm_demo";

let startBtn = document.getElementById('start-sound');

async function setup() {
  const bin = await fetchWasm('wasm_demo/wasm_demo_bg.wasm');
  const buf = await bin.arrayBuffer();

  let context =  new AudioContext();
  await context.audioWorklet.addModule('processor.js');
  let node = new AudioWorkletNode(context, 'web-synth-proto');
  node.port.postMessage({type: 'init-wasm', wasmData: buf});
  node.connect(context.destination);
}

startBtn.addEventListener('click', () => {
  setup();
});
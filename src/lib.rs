use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// extern {
//     pub fn alert(s: &str);
// }


// #[wasm_bindgen]
// pub fn greet(name: &str) {
//     alert(&format!("Hello, {}", name));
// }

#[wasm_bindgen]
pub struct SineOsc {
    sample_rate: i32,
    cycler: i32,
}

#[wasm_bindgen]
impl SineOsc {
    pub fn sample(&mut self, pitch: i32, gain: f32) -> f32 {
        let seed: f32 = ((2.0 / std::f32::consts::PI) / (self.sample_rate / pitch) as f32) * self.cycler as f32;

        self.cycler += 1;

        if self.cycler > self.sample_rate {
            self.cycler = 0;
        }

        gain * seed.sin()
    }

    pub fn new(sample_rate: i32) -> Self {
        SineOsc { sample_rate: sample_rate, cycler: 0 }
    }
}

#[no_mangle]
pub extern "C" fn samplex(pitch: i32, gain: f32, sample_rate: i32, transport: i32) -> f32 {
    let seed = ((2.0 * std::f32::consts::PI) / (sample_rate / pitch) as f32) * transport as f32;

    gain * seed.sin()
}
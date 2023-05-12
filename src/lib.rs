use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SineOsc {
    sample_rate: i32,
    cycler: i32,
}

#[wasm_bindgen]
impl SineOsc {
    pub fn sample(&mut self, pitch: f64, gain: f64) -> f64 {
        let seed: f64 = ((2.0 * std::f64::consts::PI) / (self.sample_rate as f64 / pitch)) * self.cycler as f64;

        self.cycler += 1;

        if self.cycler as f64 > (self.sample_rate as f64 / pitch) {
            self.cycler = 0;
        }

        gain * seed.sin()
    }

    pub fn new(sample_rate: i32) -> Self {
        SineOsc { sample_rate: sample_rate, cycler: 0 }
    }
}
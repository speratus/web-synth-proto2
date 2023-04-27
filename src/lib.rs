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
        let seed: f32 = ((2.0 * std::f32::consts::PI) / (self.sample_rate / pitch) as f32) * self.cycler as f32;

        self.cycler += 1;

        if self.cycler > (self.sample_rate / pitch) {
            self.cycler = 0;
        }

        gain * seed.sin()
    }

    pub fn new(sample_rate: i32) -> Self {
        SineOsc { sample_rate: sample_rate, cycler: 0 }
    }
}

#[wasm_bindgen]
pub struct OvertonalOsc {
    sample_rate: i32,
    cycler: i32,
    overtone_volumes: Vec<f32>,
}


#[wasm_bindgen]
impl OvertonalOsc {
    
    pub fn new(sample_rate: i32, overtones: &[f32]) -> Self {
        let tone_vols = overtones.to_vec();

        OvertonalOsc {
            sample_rate: sample_rate,
            cycler: 0,
            overtone_volumes: tone_vols,
        }
    }

    pub fn sample(&mut self, pitch: f32, gain: f32) -> f32 {
        let mut root = self.wave(pitch, gain);

        let mut multiplier = 2.0;

        for vol in self.overtone_volumes.iter() {
            root += self.wave(pitch * multiplier, gain * vol);
            multiplier += 1.0;
        }

        self.cycler += 1;

        if self.cycler > (self.sample_rate as f32 / pitch) as i32 {
            self.cycler = 0;
        }

        root
    }

    fn wave(&self, pitch: f32, gain: f32) -> f32 {
        let seed = ((2.0 * std::f32::consts::PI) / (self.sample_rate as f32 / pitch)) * self.cycler as f32;

        gain * seed.sin()
    }

}


#[no_mangle]
pub extern "C" fn samplex(pitch: i32, gain: f32, sample_rate: i32, transport: i32) -> f32 {
    let seed = ((2.0 * std::f32::consts::PI) / (sample_rate / pitch) as f32) * transport as f32;

    gain * seed.sin()
}
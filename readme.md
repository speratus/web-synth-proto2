# Websynth Prototype
This project is a proof of concept for using Rust to generate samples for a Web Audio API backed synthesizer.

You can read an introductiont to the project on [dev.to](https://dev.to/speratus/building-a-browser-based-synthesizer-using-rust-and-webassembly-3kpl).

## Dependencies
To build this project you will need the following:

* [Rust](https://www.rust-lang.org/)
* [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

## Building
To build the Rust components of this project, simply run

```sh
wasm-pack build --target web
```
See [this post](https://dev.to/speratus/building-a-browser-based-synthesizer-using-rust-and-webassembly-3kpl) for details regarding how to integrate it into a web page.

## Running
This project can be run using Visual Studio Code's "Live Server" extension. Simply install it, and follow the instructions to go live.
Once you have the server running, navigate to the "www" directory to see the web page.

If you don't have Visual Studio Code, you should also be able to open `index.html` in the `www` directory in any modern web browser.
Although I haven't thoroughly tested this method, I don't think you will run into any problems running the project this way.
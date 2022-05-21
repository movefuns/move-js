# Wasmer-JS Move-compile Demo

Compile the move example module in-browser using wasmer-js


## Prerequisites

### rust
To be able to run Wasmer inside our Rust application, we will need Rust installed in our system.
The easiest way to get Rust in your system is via Rustup.
To get Rustup on Linux and macOS, you can run the following:

```bash
curl https://sh.rustup.rs -sSf | sh
```

To install Rust on Windows, download and run rustup-init.exe, then follow the onscreen instructions.

### parcel
Make sure Parcel has been installed and is available from the command line

```bash
npm install -g parcel
```

## Run Demo

```bash
npm install -d
npm run build
npm run dev
```
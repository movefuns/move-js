use std::panic;
use std::fs::File;
use std::io::Write;
use move_compiler::Compiler;
use move_compiler::compiled_unit::CompiledUnit;
use move_compiler::diagnostics::{unwrap_or_report_diagnostics, report_diagnostics_to_buffer};

use std::path::Path;
use base64::{encode};

fn hook_impl(info: &panic::PanicInfo) {
    let _ = println!("{}", info);
}

fn compile(path: &Path) {
    let targets: Vec<String> = vec![path.to_str().unwrap().to_owned()];
    let deps: Vec<String> = vec![];

    let c = Compiler::new(&targets, &deps);
    let (source_text, compiled_result) = c.build().expect("build fail");

    for (key, value) in &source_text {
        println!("build result fileHash:{}, path: {}, content: {}", key, value.0, value.1);
    }

    let compiled_units = unwrap_or_report_diagnostics(&source_text, compiled_result);

    println!(
        "{}",
        String::from_utf8_lossy(&report_diagnostics_to_buffer(
            &source_text,
            compiled_units.1
        ))
    );

    let mv_units:Vec<CompiledUnit> = compiled_units
        .0
        .into_iter()
        .map(|c| c.into_compiled_unit())
        .collect();

    for mv in mv_units {
        let symbol = mv.name();
        let name = symbol.as_ref();

        let bytes = mv.serialize_debug();
        let text = encode(&bytes);

        println!("Module {} mv base64: {}", name, &text);
    }
}

fn main() {
    panic::set_hook(Box::new(hook_impl));

    let code = r#"
    module 0x1::M {
        struct M{
            value: u64,
        }

        public fun hello(){
        }
    }
"#;


    // write code to test.move
    let mut file = File::create("/tmp/test.move").expect("create failed");
    file.write_all(code.as_bytes()).expect("write failed");
    
    // compile test.move
    let path = Path::new("/tmp/test.move");
    compile(&path);
}

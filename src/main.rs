use std::env;
use std::panic;
use walkdir::WalkDir;
use move_compiler::Compiler;
use move_compiler::compiled_unit::CompiledUnit;
use move_compiler::diagnostics::{unwrap_or_report_diagnostics, report_diagnostics_to_buffer};
use move_compiler::shared::{Flags, NumericalAddress};

use std::path::Path;
use base64::{encode};
use std::collections::{BTreeMap, HashMap};

fn hook_impl(info: &panic::PanicInfo) {
    let _ = println!("{}", info);
}

pub fn starcoin_framework_named_addresses() -> BTreeMap<String, NumericalAddress> {
    let mapping = [
        ("VMReserved", "0x0"),
        ("Genesis", "0x1"),
        ("StarcoinFramework", "0x1"),
        ("StarcoinAssociation", "0xA550C18"),
    ];
    mapping
        .iter()
        .map(|(name, addr)| (name.to_string(), NumericalAddress::parse_str(addr).unwrap()))
        .collect()
}

fn compile_package(path: &Path) {
    let mut targets: Vec<String> = vec![];
    let deps: Vec<String> = vec![];

    let sources_dir = path.join("sources");

    for entry in WalkDir::new(sources_dir) {
        let entry_ref = entry.as_ref();

        if entry_ref.unwrap().path().is_file() {
            let move_file_path = entry_ref.unwrap().path().to_str().unwrap().to_owned();
            targets.push(move_file_path);
        }
    }

    println!("compile targets: {:?}", targets);

    let c = Compiler::new(&targets, &deps)
        .set_named_address_values(starcoin_framework_named_addresses())
        .set_flags(Flags::empty()
        .set_sources_shadow_deps(true));

    let (source_text, compiled_result) = c.build().expect("build fail");

    let compiled_units = unwrap_or_report_diagnostics(&source_text, compiled_result);

    println!(
        "diagnostics result: {}",
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

    let args: Vec<String> = env::args().collect();
    println!("args: {:?}", args);

    let pwd = env::var("PWD").expect("must has set PWD env");
    let current_path = Path::new(&pwd);
    println!("pwd: {:?}", current_path);

    compile_package(&current_path);
}

use walkdir::WalkDir;
use move_compiler::Compiler;
use move_compiler::compiled_unit::CompiledUnit;
use move_compiler::diagnostics::{unwrap_or_report_diagnostics, report_diagnostics_to_buffer};
use move_compiler::shared::{Flags, NumericalAddress};

use anyhow::{Result};
use std::{
    collections::{BTreeMap},
    path::{Path},
};

fn starcoin_framework_named_addresses() -> BTreeMap<String, NumericalAddress> {
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

fn save_under(root_path: &Path, file: &str, bytes: &[u8]) -> Result<()> {
    let path_to_save = root_path.join(file);

    println!("Module {} saved!", path_to_save.as_path().to_str().unwrap());

    let parent = path_to_save.parent().unwrap();
    std::fs::create_dir_all(&parent)?;
    std::fs::write(path_to_save, bytes).map_err(|err| err.into())
}

pub fn compile_package(package_path: &str, install_dir: &str, target: &str) {
    let mut targets: Vec<String> = vec![];
    let deps: Vec<String> = vec![];

    let path = Path::new(&package_path);
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

    let root_path = Path::new(&install_dir);
    for mv in mv_units {
        let symbol = mv.name();
        let name = symbol.as_ref();

        let file_name = format!("{}.mv", name);
        let bytes = mv.serialize_debug();
        _ = save_under(root_path, &file_name, &bytes);
    }

    println!("compile ok!");
}
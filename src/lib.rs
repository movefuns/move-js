use walkdir::WalkDir;
use move_compiler::Compiler;
use move_compiler::compiled_unit::CompiledUnit;
use move_compiler::diagnostics::{unwrap_or_report_diagnostics};
use move_compiler::shared::{Flags, NumericalAddress};

use anyhow::{Result};
use std::{
    collections::{BTreeMap},
};

use std::path::Path;

fn starcoin_framework_named_addresses() -> BTreeMap<String, NumericalAddress> {
    let mapping = [
        ("VMReserved", "0x0"),
        ("Genesis", "0x1"),
        ("StarcoinFramework", "0x1"),
        ("StarcoinAssociation", "0xA550C18"),
        ("Std", "0x1"),
        ("MyCounter", "0xABCDE"),
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

pub fn compile_package(package_path: &str, install_dir: &str, dep_dirs:Vec<&str>, target: &str, test_mode: bool) {
    let mut targets: Vec<String> = vec![];
    let mut deps: Vec<String> = vec![];

    let path = Path::new(&package_path);
    let sources_dir = path.join("sources");

    for entry in WalkDir::new(sources_dir) {
        let entry_ref = entry.as_ref();

        if entry_ref.unwrap().path().is_file() {
            let move_file_path = entry_ref.unwrap().path().to_str().unwrap().to_owned();
            targets.push(move_file_path);
        }
    }


    for dep_dir in dep_dirs {
        let dep_path = Path::new(dep_dir);
        let dep_sources_dir = dep_path.join("sources");

        for entry in WalkDir::new(dep_sources_dir) {
            let entry_ref = entry.as_ref();
    
            if entry_ref.unwrap().path().is_file() {
                let move_file_path = entry_ref.unwrap().path().to_str().unwrap().to_owned();
                deps.push(move_file_path);
            }
        }
    }
    
    println!("compile targets: {:?}", targets);
    println!("compile deps: {:?}", deps);

    let mut flags = Flags::empty()
        .set_sources_shadow_deps(true);
    if test_mode {
        flags = Flags::testing()
            .set_sources_shadow_deps(true);
    }

    let c = Compiler::new(&targets, &deps)
        .set_named_address_values(starcoin_framework_named_addresses())
        .set_flags(flags);

    let (source_text, compiled_result) = c.build().expect("build fail");

    let compiled_units = unwrap_or_report_diagnostics(&source_text, compiled_result);

    let mv_units:Vec<CompiledUnit> = compiled_units
        .0
        .into_iter()
        .map(|c| c.into_compiled_unit())
        .collect();

    let root_path = Path::new(&package_path);

    
    let install_path = root_path.join(&install_dir);

    for mv in mv_units {
        let symbol = mv.name();
        let name = symbol.as_ref();

        let file_name = format!("{}.mv", name);
        let bytes = mv.serialize_debug();
        _ = save_under(install_path.as_path(), &file_name, &bytes);
    }

    println!("compile ok!");
}
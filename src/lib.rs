pub mod targets;
pub mod utils;

use walkdir::WalkDir;

use move_compiler::compiled_unit::CompiledUnit;
use move_compiler::diagnostics::unwrap_or_report_diagnostics;
use move_compiler::shared::{Flags, NumericalAddress};
use move_compiler::Compiler;
use targets::target::TargetType;

use anyhow::{Error, Result};
use std::collections::BTreeMap;

use std::path::Path;

fn convert_named_addresses(address_maps: &Vec<(&str, &str)>) -> BTreeMap<String, NumericalAddress> {
    address_maps
        .iter()
        .map(|(name, addr)| (name.to_string(), NumericalAddress::parse_str(addr).unwrap()))
        .collect()
}

pub fn build_package(
    package_path: &str,
    dep_dirs: &Vec<&str>,
    address_maps: &Vec<(&str, &str)>,
    target_types: &Vec<&str>,
    test_mode: bool,
) -> Result<(), Error> {
    let mut sources: Vec<String> = vec![];
    let mut deps: Vec<String> = vec![];
    let mut targets: Vec<TargetType> = vec![];

    let path = Path::new(&package_path);
    let sources_dir = path.join("sources");

    for entry in WalkDir::new(sources_dir) {
        let entry_raw = entry?;

        if entry_raw.path().is_file() {
            let move_file_path = entry_raw.path().to_str();
            match move_file_path {
                Some(f) => {
                    sources.push(f.to_string());
                }
                _ => {}
            }
        }
    }

    for dep_dir in dep_dirs {
        let dep_path = Path::new(dep_dir);
        let dep_sources_dir = dep_path.join("sources");

        for entry in WalkDir::new(dep_sources_dir) {
            let entry_raw = entry?;

            if entry_raw.path().is_file() {
                let move_file_path = entry_raw.path().to_str();
                match move_file_path {
                    Some(f) => {
                        deps.push(f.to_string());
                    }
                    _ => {}
                }
            }
        }
    }

    for target_type in target_types {
        let target = TargetType::from((*target_type).to_string());
        targets.push(target);
    }

    let mut flags = Flags::empty().set_sources_shadow_deps(true);
    if test_mode {
        flags = Flags::testing().set_sources_shadow_deps(true);
    }

    let c = Compiler::new(&sources, &deps)
        .set_named_address_values(convert_named_addresses(address_maps))
        .set_flags(flags);

    let (source_text, compiled_result) = c.build()?;

    let compiled_units = unwrap_or_report_diagnostics(&source_text, compiled_result);

    let units: Vec<CompiledUnit> = compiled_units
        .0
        .into_iter()
        .map(|c| c.into_compiled_unit())
        .collect();

    // Output compile targets
    let root_path = Path::new(&package_path);
    targets::target::output(&units, &targets, root_path)
}

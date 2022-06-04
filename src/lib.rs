pub mod types;
pub mod serde_helper;
pub mod bcs_ext;

use walkdir::WalkDir;

use move_compiler::Compiler;
use move_compiler::compiled_unit::{CompiledUnit, NamedCompiledModule};
use move_compiler::diagnostics::{unwrap_or_report_diagnostics};
use move_compiler::shared::{Flags, NumericalAddress};
use move_binary_format::CompiledModule;

use types::script::ScriptFunction;
use types::module::Module;
use types::package::Package;
use anyhow::{Result, Error};
use std::{
    collections::{BTreeMap},
};

use std::path::Path;

fn convert_named_addresses(address_maps: Vec<(&str, &str)>) -> BTreeMap<String, NumericalAddress> {
    address_maps
        .iter()
        .map(|(name, addr)| (name.to_string(), NumericalAddress::parse_str(addr).unwrap()))
        .collect()
}

fn module(unit: &CompiledUnit) -> anyhow::Result<&CompiledModule> {
    match unit {
        CompiledUnit::Module(NamedCompiledModule { module, .. }) => Ok(module),
        _ => anyhow::bail!("Found script in modules -- this shouldn't happen"),
    }
}

fn save_package(root_dir: &Path, modules:Vec<Module>, init_script: Option<ScriptFunction>) -> Result<(), Error> {
    let mut release_dir = root_dir.join("release");

    let p = Package::new(modules, init_script)?;
    let blob = bcs_ext::to_bytes(&p)?;
    let release_path = {
        std::fs::create_dir_all(&release_dir)?;
        release_dir.push(format!(
            "{}.blob",
            "package"
        ));
        release_dir
    };
    std::fs::write(&release_path, blob)?;
    println!(
        "build done, saved: {}",
        release_path.display()
    );

    Ok(())
}

pub fn build_package(package_path: &str, dep_dirs:Vec<&str>, address_maps: Vec<(&str, &str)>, test_mode: bool) -> Result<(), Error>  {
    let mut targets: Vec<String> = vec![];
    let mut deps: Vec<String> = vec![];

    let path = Path::new(&package_path);
    let sources_dir = path.join("sources");

    for entry in WalkDir::new(sources_dir) {
        let entry_raw = entry?;

        if entry_raw.path().is_file() {
            let move_file_path = entry_raw.path().to_str();
            match move_file_path {
                Some(f) => {
                    targets.push(f.to_string());
                },
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
                    },
                    _ => {}
                }
            }
        }
    }

    let mut flags = Flags::empty()
        .set_sources_shadow_deps(true);
    if test_mode {
        flags = Flags::testing()
            .set_sources_shadow_deps(true);
    }

    let c = Compiler::new(&targets, &deps)
        .set_named_address_values(convert_named_addresses(address_maps))
        .set_flags(flags);

    let (source_text, compiled_result) = c.build()?;

    let compiled_units = unwrap_or_report_diagnostics(&source_text, compiled_result);

    let mv_units:Vec<CompiledUnit> = compiled_units
        .0
        .into_iter()
        .map(|c| c.into_compiled_unit())
        .collect();

    let root_path = Path::new(&package_path);

    let mut modules = vec![];
    
    for mv in mv_units {
        let m = module(&mv)?;
        let code = {
            let mut data = vec![];
            m.serialize(&mut data)?;
            data
        };

        modules.push(Module::new(code));
    }

    save_package(root_path, modules, None)?;

    Ok(())
}
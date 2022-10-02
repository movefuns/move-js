pub mod cli;
pub mod targets;
pub mod utils;

use cli::DisassembleArgs;
use std::fs::File;
use std::io::{Read, Write};
use walkdir::WalkDir;

use move_compiler::compiled_unit::CompiledUnit;
use move_compiler::diagnostics::unwrap_or_report_diagnostics;
use move_compiler::shared::{Flags, NumericalAddress};
use move_compiler::Compiler;
use targets::target::TargetType;

use move_binary_format::{
    binary_views::BinaryIndexedView,
    file_format::{CompiledModule, CompiledScript},
};
use move_bytecode_source_map::mapping::SourceMapping;
use move_disassembler::disassembler::{Disassembler, DisassemblerOptions};
use move_ir_types::location::Spanned;

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
    init_function: &str,
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
    targets::target::output(&units, &targets, root_path, init_function)
}

pub fn disassemble(args: DisassembleArgs) {
    let path = Path::new(&args.file_path);

    let mut file = match File::open(&path) {
        Err(e) => panic!("{}", e),
        Ok(f) => f,
    };

    let mut s = String::new();
    match file.read_to_string(&mut s) {
        Ok(_) => println!("ok"),
        Err(e) => println!("{}", e),
    }

    if s.find("x") != Some(0) {
        s.replace_range(0..2, "");
    }

    let bytecode_bytes = hex::decode(s.as_bytes()).unwrap();

    let mut disassembler_options = DisassemblerOptions::new();
    disassembler_options.print_code = !args.skip_code;
    disassembler_options.only_externally_visible = !args.skip_private;
    disassembler_options.print_basic_blocks = !args.skip_basic_blocks;
    disassembler_options.print_locals = !args.skip_locals;

    let no_loc = Spanned::unsafe_no_loc(()).loc;
    let module: CompiledModule;
    let script: CompiledScript;
    let biv = if args.is_script {
        script = CompiledScript::deserialize(&bytecode_bytes)
            .expect("Script blob can't be deserialized");
        BinaryIndexedView::Script(&script)
    } else {
        module = CompiledModule::deserialize(&bytecode_bytes)
            .expect("Module blob can't be deserialized");
        BinaryIndexedView::Module(&module)
    };

    let source_mapping =
        SourceMapping::new_from_view(biv, no_loc).expect("Unable to build dummy source mapping");

    let disassembler = Disassembler::new(source_mapping, disassembler_options);

    let result = match disassembler.disassemble() {
        Ok(v) => ("d", v),
        Err(e) => ("e", e.to_string()),
    };

    let mut output = path.parent().unwrap().to_path_buf();

    output.push(format!(
        "{}.{}",
        path.file_name().unwrap().to_str().unwrap(),
        result.0
    ));

    let mut f = File::create(output.as_path()).unwrap();

    println!("{}", result.1);

    match writeln!(f, "{}", result.1) {
        Err(e) => panic!("{}", e),
        _ => {}
    }
}

use std::env;
use std::panic;

use clap::Parser;
use move_binary_format::{
    binary_views::BinaryIndexedView,
    file_format::{CompiledModule, CompiledScript},
};
use move_bytecode_source_map::mapping::SourceMapping;
use move_disassembler::disassembler::{Disassembler, DisassemblerOptions};
use move_ir_types::location::Spanned;

use move_web::cli::{CliOptions, Commands};

fn hook_impl(info: &panic::PanicInfo) {
    let _ = println!("{}", info);
}

fn parse_address_map(address_map: &str) -> Result<(&str, &str), String> {
    let mut tokens = address_map.split(":");

    match tokens.next() {
        Some(name) => match tokens.next() {
            Some(address) => Ok((name, address)),
            None => Err(format!("Not found address name in address_map",)),
        },
        None => Err(format!("Not found address in address_map",)),
    }
}

fn main() -> std::io::Result<()> {
    panic::set_hook(Box::new(hook_impl));

    let pwd = env::var("PWD").expect("must has set PWD env");
    println!("pwd: {:?}", pwd);

    let args = CliOptions::parse();

    match args.commands {
        Commands::Build {
            dependency_dirs,
            address_maps,
            targets,
            test,
            init_function,
        } => {
            let dependency_dirs = match dependency_dirs {
                Some(ref v) => v.split(",").collect(),
                None => vec![],
            };

            println!("dependency_dirs: {:?}", dependency_dirs);

            let address_maps = match address_maps {
                Some(ref v) => v
                    .split(",")
                    .map(|x: &str| parse_address_map(x).unwrap())
                    .collect(),
                None => vec![], // None => vec!<&str, &str>[],
            };
            println!("address_maps: {:?}", address_maps);

            let targets = match targets {
                Some(ref v) => v.split(",").collect(),
                None => vec!["starcoin"],
            };
            println!("targets: {:?}", targets);

            let test_mode = test.unwrap_or(false);
            println!("test_mode: {:?}", test);

            let init_function = init_function.unwrap_or("".to_string());
            println!("init_function: {:?}", init_function);

            let ret = move_web::build_package(
                &pwd,
                &dependency_dirs,
                &address_maps,
                &targets,
                test_mode,
                init_function.as_str(),
            );
            match ret {
                Ok(()) => {
                    println!("build package ok");
                }
                Err(e) => {
                    println!("build package error: {:?}", e);
                }
            }
        }

        Commands::Disassemble {
            skip_private,
            skip_code,
            skip_locals,
            skip_basic_blocks,
            is_script,
            bytecode,
        } => {
            let bytecode_bytes = hex::decode(bytecode).unwrap();

            let mut disassembler_options = DisassemblerOptions::new();
            disassembler_options.print_code = !skip_code;
            disassembler_options.only_externally_visible = !skip_private;
            disassembler_options.print_basic_blocks = !skip_basic_blocks;
            disassembler_options.print_locals = !skip_locals;

            let no_loc = Spanned::unsafe_no_loc(()).loc;
            let module: CompiledModule;
            let script: CompiledScript;
            let bytecode = if is_script {
                script = CompiledScript::deserialize(&bytecode_bytes)
                    .expect("Script blob can't be deserialized");
                BinaryIndexedView::Script(&script)
            } else {
                module = CompiledModule::deserialize(&bytecode_bytes)
                    .expect("Module blob can't be deserialized");
                BinaryIndexedView::Module(&module)
            };

            let source_mapping = SourceMapping::new_from_view(bytecode, no_loc)
                .expect("Unable to build dummy source mapping");

            let disassembler = Disassembler::new(source_mapping, disassembler_options);

            match disassembler.disassemble() {
                Ok(v) => {
                    println!("ok");
                    println!("{}", v);
                }
                Err(e) => {
                    println!("err");
                    println!("{}", e);
                }
            }

            // let dissassemble_string = disassembler.disassemble().expect("Unable to dissassemble");
            //
            //
            // println!("hello, dissassemble {}", dissassemble_string);
        }
    }

    Ok(())
}

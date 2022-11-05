mod types;

use move_binary_format::CompiledModule;
use move_compiler::compiled_unit::{CompiledUnit, NamedCompiledModule};

use crate::targets::target::Target;
use crate::utils::bcs_ext;
use anyhow::{Error, Result};
use starcoin_crypto::hash::PlainCryptoHash;
use std::path::Path;
use types::function::FunctionId;
use types::module::Module;
use types::package::Package;
use types::script::ScriptFunction;

pub struct StarcoinTarget {}

impl StarcoinTarget {
    pub fn new() -> Self {
        return Self {};
    }
}

impl Target for StarcoinTarget {
    fn output(
        self,
        units: &Vec<CompiledUnit>,
        dest_path: &Path,
        init_function: &str,
    ) -> Result<()> {
        let mut modules = vec![];

        for mv in units {
            let m = module(&mv)?;
            let code = {
                let mut data = vec![];
                m.serialize(&mut data)?;
                data
            };

            modules.push(Module::new(code));
        }

        let mut init_script: Option<ScriptFunction> = None;
        if init_function != "" {
            let func = FunctionId::from(init_function);
            init_script = match &func {
                Ok(script) => {
                    let script_function = script.clone();
                    Some(ScriptFunction::new(
                        script_function.module,
                        script_function.function,
                        vec![],
                        vec![],
                    ))
                }
                _ => anyhow::bail!("Found script in modules -- this shouldn't happen"),
            };
        }

        save_release_package(dest_path, modules, init_script)?;

        Ok(())
    }
}

fn module(unit: &CompiledUnit) -> anyhow::Result<&CompiledModule> {
    match unit {
        CompiledUnit::Module(NamedCompiledModule { module, .. }) => Ok(module),
        _ => anyhow::bail!("Found script in modules -- this shouldn't happen"),
    }
}

fn save_release_package(
    root_dir: &Path,
    modules: Vec<Module>,
    init_script: Option<ScriptFunction>,
) -> Result<(), Error> {
    let mut release_dir = root_dir.join("release");

    let p = Package::new(modules, init_script)?;
    let blob = bcs_ext::to_bytes(&p)?;
    let release_path = {
        std::fs::create_dir_all(&release_dir)?;
        release_dir.push(format!("{}.blob", "package"));
        release_dir.to_path_buf()
    };
    std::fs::write(&release_path, blob)?;

    let release_hash_path = {
        release_dir.pop();
        release_dir.push("hash.txt");
        release_dir
    };

    let hash = p.crypto_hash().to_string();

    std::fs::write(&release_hash_path, &hash)?;

    println!("build done, saved: {}, {}", release_path.display(), hash);

    Ok(())
}

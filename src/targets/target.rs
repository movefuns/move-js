use core::fmt::{Display, Formatter, Result};
use move_compiler::compiled_unit::CompiledUnit;
use std::path::Path;

pub trait Target {
    fn output(
        self,
        units: &Vec<CompiledUnit>,
        dest_path: &Path,
        init_function: &str,
    ) -> anyhow::Result<()>;
}

pub enum TargetType {
    Starcoin,
    Unknown,
}

impl Display for TargetType {
    fn fmt(&self, f: &mut Formatter) -> Result {
        match self {
            TargetType::Starcoin => write!(f, "starcoin"),
            TargetType::Unknown => write!(f, "unkonw"),
        }
    }
}

impl From<String> for TargetType {
    fn from(target_type: String) -> Self {
        match target_type {
            target_type if target_type == "starcoin" => TargetType::Starcoin,
            _ => TargetType::Unknown,
        }
    }
}

pub fn output(
    units: &Vec<CompiledUnit>,
    target_types: &Vec<TargetType>,
    root_path: &Path,
    init_function: &str,
) -> anyhow::Result<()> {
    let root_dir = root_path.join("target");

    for target_type in target_types {
        match target_type {
            TargetType::Starcoin => {
                let dest_path = root_dir.join("starcoin");
                let target = crate::targets::starcoin::StarcoinTarget::new();
                target.output(units, dest_path.as_path(), init_function)?;
            }
            _ => anyhow::bail!("not support target type"),
        }
    }

    Ok(())
}

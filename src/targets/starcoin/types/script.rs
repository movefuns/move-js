use crate::utils::serde_helper::vec_bytes;
use move_core_types::identifier::{IdentStr, Identifier};
use move_core_types::language_storage::{ModuleId, TypeTag};
use schemars::{self, JsonSchema};
use serde::{Deserialize, Serialize};

/// Call a Move script function.
#[derive(Clone, Debug, Hash, Eq, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct ScriptFunction {
    #[schemars(with = "String")]
    module: ModuleId,
    #[schemars(with = "String")]
    function: Identifier,
    #[schemars(with = "Vec<String>")]
    ty_args: Vec<TypeTag>,
    #[serde(with = "vec_bytes")]
    #[schemars(with = "Vec<String>")]
    args: Vec<Vec<u8>>,
}

impl ScriptFunction {
    pub fn new(
        module: ModuleId,
        function: Identifier,
        ty_args: Vec<TypeTag>,
        args: Vec<Vec<u8>>,
    ) -> Self {
        ScriptFunction {
            module,
            function,
            ty_args,
            args,
        }
    }

    pub fn module(&self) -> &ModuleId {
        &self.module
    }

    pub fn function(&self) -> &IdentStr {
        &self.function
    }

    pub fn ty_args(&self) -> &[TypeTag] {
        &self.ty_args
    }

    pub fn args(&self) -> &[Vec<u8>] {
        &self.args
    }
    pub fn into_inner(self) -> (ModuleId, Identifier, Vec<TypeTag>, Vec<Vec<u8>>) {
        (self.module, self.function, self.ty_args, self.args)
    }
}

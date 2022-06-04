use schemars::{self, JsonSchema};
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Clone, Hash, Eq, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct Module {
    #[serde(with = "serde_bytes")]
    #[schemars(with = "String")]
    code: Vec<u8>,
}
impl From<Module> for Vec<u8> {
    fn from(m: Module) -> Self {
        m.code
    }
}
impl Module {
    pub fn new(code: Vec<u8>) -> Module {
        Module { code }
    }

    pub fn code(&self) -> &[u8] {
        &self.code
    }
}

impl fmt::Debug for Module {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Module")
            .field("code", &hex::encode(&self.code))
            .finish()
    }
}

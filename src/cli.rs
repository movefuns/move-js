use clap::Parser;

#[derive(Parser)]
#[clap(version, author, about, long_about = None)]
pub struct CliOptions {
    #[clap(subcommand)]
    pub commands: Commands,
}

#[derive(Parser)]
pub enum Commands {
    #[clap(name = "build")]
    Build {
        #[clap(long = "dependency_dirs")]
        dependency_dirs: Option<String>,

        #[clap(long = "address_maps")]
        address_maps: Option<String>,

        #[clap(long = "targets", short = 't')]
        targets: Option<String>,

        #[clap(long = "test")]
        test: Option<bool>,

        #[clap(long = "init_function", short = 'i')]
        init_function: Option<String>,
    },
    #[clap(name = "disassemble")]
    Disassemble(DisassembleArgs),
}

#[derive(Parser)]
pub struct DisassembleArgs {
    /// Skip printing of private functions.
    #[clap(long = "skip-private")]
    pub skip_private: bool,

    /// Do not print the disassembled bytecodes of each function.
    #[clap(long = "skip-code")]
    pub skip_code: bool,

    /// Do not print locals of each function.
    #[clap(long = "skip-locals")]
    pub skip_locals: bool,

    /// Do not print the basic blocks of each function.
    #[clap(long = "skip-basic-blocks")]
    pub skip_basic_blocks: bool,

    /// Treat input file as a script (default is to treat file as a module)
    #[clap(short = 's', long = "script")]
    pub is_script: bool,

    /// The path to the bytecode file to disassemble; let's call it file.mv. We assume that two
    /// other files reside under the same directory: a source map file.mvsm (possibly) and the Move
    /// source code file.move.
    #[clap(short = 'b', long = "file_path")]
    pub file_path: String,
}

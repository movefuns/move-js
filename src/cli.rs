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
    Disassemble {
        #[clap(long = "codes")]
        codes: String,
    },
}

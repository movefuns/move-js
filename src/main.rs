
extern crate args;
extern crate getopts;

use std::env;
use std::panic;
use getopts::Occur;
use args::Args;

const PROGRAM_DESC: &'static str = "Run this program";
const PROGRAM_NAME: &'static str = "program";

fn parse_args() -> Args {
    let mut args = Args::new(PROGRAM_NAME, PROGRAM_DESC);
    args.flag("h", "help", "Print the usage menu");
    args.option("i",
        "install_dir",
        "Installation directory for compiled artifacts. Defaults to current directory",
        "",
        Occur::Req,
        Some(String::from("./build")));
    args.option("",
        "target",
        "Compile target platform, like starcoin",
        "",
        Occur::Optional,
        Some(String::from("starcoin")));
    args.option("",
        "test",
        "Compile in 'test' mode",
        "",
        Occur::Optional,
        Some(String::from("false")));

    args.parse(env::args()).expect("no error when parse");
    args
}

fn hook_impl(info: &panic::PanicInfo) {
    let _ = println!("{}", info);
}

fn main() {
    panic::set_hook(Box::new(hook_impl));

    let pwd = env::var("PWD").expect("must has set PWD env");
    println!("pwd: {:?}", pwd);

    let args = parse_args();

    let default_install_dir = String::from("./build");
    let install_dir = args.value_of::<String>(&"install_dir").unwrap_or(default_install_dir);
    println!("install_dir: {:?}", install_dir);

    let default_target = String::from("starcoin");
    let target = args.value_of::<String>(&"target").unwrap_or(default_target);
    println!("target: {:?}", install_dir);

    let test_mode = args.value_of::<bool>("test").unwrap_or(false);
    println!("test_mode: {:?}", test_mode);

    move_web::compile_package(&pwd, &install_dir, &target, test_mode);
}

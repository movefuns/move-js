extern crate args;
extern crate getopts;

use args::Args;
use getopts::Occur;
use std::env;
use std::panic;

const PROGRAM_DESC: &'static str = "Run this program";
const PROGRAM_NAME: &'static str = "move-web";

fn parse_args() -> Args {
    let mut args = Args::new(PROGRAM_NAME, PROGRAM_DESC);
    args.flag("h", "help", "Print the usage menu");
    args.option(
        "",
        "dependency_dirs",
        "dependency Directory",
        "",
        Occur::Optional,
        Some(String::from("")),
    );
    args.option(
        "",
        "address_maps",
        "address maps",
        "",
        Occur::Optional,
        Some(String::from("")),
    );
    args.option(
        "t",
        "targets",
        "target chain",
        "",
        Occur::Optional,
        Some(String::from("")),
    );
    args.option(
        "",
        "test",
        "Compile in 'test' mode",
        "",
        Occur::Optional,
        Some(String::from("false")),
    );
    args.option(
        "i",
        "init_function",
        " init script function to execute, example: 0x123::MyScripts::init_scr",
        "",
        Occur::Optional,
        Some(String::from("")),
    );

    args.parse(env::args()).expect("no error when parse");
    args
}

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

    let args = parse_args();

    let default_deps = String::from("");
    let mut dependency_dirs: Vec<&str> = vec![];
    let dependency_dirs_text = args
        .value_of::<String>(&"dependency_dirs")
        .unwrap_or(default_deps);
    if dependency_dirs_text != "" {
        dependency_dirs = dependency_dirs_text.as_str().split(",").collect();
    }
    println!("dependency_dirs: {:?}", dependency_dirs);

    let default_address_map = String::from("");
    let mut addresse_maps: Vec<(&str, &str)> = vec![];
    let addresse_maps_text = args
        .value_of::<String>("address_maps")
        .unwrap_or(default_address_map);
    if addresse_maps_text != "" {
        addresse_maps = addresse_maps_text
            .as_str()
            .split(",")
            .map(|x: &str| parse_address_map(x).unwrap())
            .collect();
    }
    println!("address_maps: {:?}", addresse_maps);

    let default_targets = String::from("starcoin");
    let mut targets: Vec<&str> = vec![];
    let targets_text = args
        .value_of::<String>(&"targets")
        .unwrap_or(default_targets);
    if targets_text != "" {
        targets = targets_text.as_str().split(",").collect();
    }
    println!("targets: {:?}", targets);

    let test_mode = args.value_of::<bool>("test").unwrap_or(false);
    println!("test_mode: {:?}", test_mode);

    let default_init_func = String::from("");
    let init_function = args.value_of::<String>("init_function").unwrap_or(default_init_func);
    println!("init_function: {:?}", init_function);

    let ret = move_web::build_package(&pwd, &dependency_dirs, &addresse_maps, &targets, test_mode, init_function.as_str());
    match ret {
        Ok(()) => {
            println!("build package ok");
        }
        Err(e) => {
            println!("build package error: {:?}", e);
        }
    }

    Ok(())
}

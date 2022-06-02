
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
        Some(String::from("build")));
    args.option("",
        "dependency_dirs",
        "dependency Directory",
        "",
        Occur::Optional,
        Some(String::from("")));
    args.option("",
        "address_maps",
        "address maps",
        "",
        Occur::Optional,
        Some(String::from("")));
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

fn parse_address_map(address_map: &str)-> Result<(&str, &str), String>{
    let mut tokens = address_map.split(":");

    match tokens.next() {
        Some(name) => {
            match tokens.next() {
                Some(address) => {
                    Ok((name, address))
                }
                None => {
                    Err(format!(
                        "Not found address name in address_map",
                    ))
                }
            }
        }
        None => {
            Err(format!(
                "Not found address in address_map",
            ))
        }
    }
}

fn main() -> std::io::Result<()>{
    panic::set_hook(Box::new(hook_impl));

    let pwd = env::var("PWD").expect("must has set PWD env");
    println!("pwd: {:?}", pwd);

    let args = parse_args();

    let default_install_dir = String::from("build");
    let install_dir = args.value_of::<String>(&"install_dir").unwrap_or(default_install_dir);
    println!("install_dir: {:?}", install_dir);

    let default_deps = String::from("");
    let mut dependency_dirs:Vec<&str> = vec![];
    let dependency_dirs_text = args.value_of::<String>(&"dependency_dirs").unwrap_or(default_deps);
    if dependency_dirs_text != "" {
        dependency_dirs = dependency_dirs_text.as_str().split(",").collect();
    }
    println!("dependency_dirs: {:?}", dependency_dirs);
    
    let default_address_map = String::from("");
    let mut addresse_maps:Vec<(&str, &str)> = vec![];
    let addresse_maps_text = args.value_of::<String>("address_maps").unwrap_or(default_address_map);
    if addresse_maps_text != "" {
        addresse_maps = addresse_maps_text.as_str().split(",").
            map(|x:&str| parse_address_map(x).unwrap()).
            collect();
    }

    println!("address_maps: {:?}", addresse_maps);

    let default_target = String::from("starcoin");
    let target = args.value_of::<String>(&"target").unwrap_or(default_target);
    println!("target: {:?}", install_dir);

    let test_mode = args.value_of::<bool>("test").unwrap_or(false);
    println!("test_mode: {:?}", test_mode);

    move_web::compile_package(&pwd, &install_dir, dependency_dirs, addresse_maps, &target, test_mode);

    Ok(())
}

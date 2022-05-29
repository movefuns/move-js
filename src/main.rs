
use std::env;
use std::panic;

fn hook_impl(info: &panic::PanicInfo) {
    let _ = println!("{}", info);
}

fn main() {
    panic::set_hook(Box::new(hook_impl));

    let pwd = env::var("PWD").expect("must has set PWD env");
    println!("pwd: {:?}", pwd);

    let args: Vec<String> = env::args().collect();
    println!("args: {:?}", args);

    let install_dir = args[1].as_str();
    println!("install_dir: {:?}", install_dir);

    move_web::compile_package(&pwd, install_dir, "starcoin");
}

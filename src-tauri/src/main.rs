// 在 Windows 发布模式下隐藏控制台窗口，请勿删除!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod init;
mod tray;
mod user_cmd;

use init::CustomInit;
use user_cmd::{
    get_app_version, get_user_info, play_sound, save_user_info, screenshot, set_height,
    toggle_devtools,
};

fn main() {
    tauri::Builder::default()
        // 初始化所有插件
        .init_plugin()
        // 初始化 webview 窗口事件
        .init_webwindow_event()
        // 初始化系统窗口事件
        .init_window_event()
        .setup(move |app| {
            // 创建系统托盘
            tray::create_tray(app.handle())?;
            Ok(())
        })
        // 注册所有 invoke 命令
        .invoke_handler(tauri::generate_handler![
            get_user_info,
            save_user_info,
            set_height,
            screenshot,
            play_sound,
            get_app_version,
            toggle_devtools
        ])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时发生错误");
}

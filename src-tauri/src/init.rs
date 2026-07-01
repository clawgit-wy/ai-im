use tauri::{LogicalSize, Manager, Runtime, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;

/// 自定义初始化 trait，为 Tauri Builder 扩展插件注册和事件处理能力
pub trait CustomInit {
    /// 初始化所有插件
    fn init_plugin(self) -> Self;

    /// 初始化 webview 窗口事件
    fn init_webwindow_event(self) -> Self;

    /// 初始化系统窗口事件
    fn init_window_event(self) -> Self;
}

impl<R: Runtime> CustomInit for tauri::Builder<R> {
    /// 注册所有需要的 Tauri 插件
    fn init_plugin(self) -> Self {
        self.plugin(tauri_plugin_os::init())
            .plugin(tauri_plugin_shell::init())
            .plugin(tauri_plugin_websocket::init())
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_process::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_upload::init())
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_clipboard_manager::init())
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec![]),
            ))
    }

    /// 注册 webview 窗口事件（预留扩展）
    fn init_webwindow_event(self) -> Self {
        self.on_webview_event(|_webview, _event| {
            // 预留：可在此处理 webview 级别的事件
        })
    }

    /// 注册系统窗口事件
    fn init_window_event(self) -> Self {
        self.on_window_event(|window, event: &WindowEvent| match event {
            WindowEvent::Focused(flag) => {
                // 当非托盘窗口获得焦点时，隐藏托盘菜单窗口
                if window.label() != "tray" && *flag {
                    if let Some(tray_window) = window.app_handle().get_webview_window("tray") {
                        let _ = tray_window.hide();
                    }
                }
                // 当托盘窗口失去焦点时，自动隐藏
                if window.label() == "tray" && !flag {
                    let _ = window.hide();
                }
            }
            WindowEvent::Resized(ps) => {
                // 限制主窗口最小高度
                if window.label() == "home" {
                    if let Ok(sf) = window.scale_factor() {
                        let ls = ps.to_logical(sf);
                        let min_height = 505;
                        if ls.height < min_height {
                            let _ =
                                window.set_size(LogicalSize::new(ls.width, min_height));
                        }
                    }
                }
            }
            _ => {}
        })
    }
}

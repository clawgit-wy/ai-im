use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalPosition, Runtime,
};

/// 创建系统托盘图标
///
/// - 左键点击：显示并聚焦主窗口（login / home）
/// - 右键点击：在鼠标位置上方显示托盘菜单窗口
pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let _ = TrayIconBuilder::with_id("tray")
        .tooltip("AI-IM")
        .icon(app.default_window_icon().unwrap().clone())
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                position,
                button,
                button_state,
                ..
            } => match button {
                // 左键点击：显示主窗口
                MouseButton::Left => {
                    let windows = tray.app_handle().webview_windows();
                    for (label, win) in windows {
                        if label == "login" || label == "home" {
                            let _ = win.show();
                            let _ = win.unminimize();
                            let _ = win.set_focus();
                        }
                    }
                }
                // 右键按下：显示托盘菜单窗口
                MouseButton::Right if MouseButtonState::Down == button_state => {
                    let tray_window = match tray.app_handle().get_webview_window("tray") {
                        Some(w) => w,
                        None => return,
                    };
                    if let Ok(outer_size) = tray_window.outer_size() {
                        // 将托盘菜单窗口定位到鼠标上方
                        let _ = tray_window.set_position(PhysicalPosition::new(
                            position.x,
                            position.y - outer_size.height as f64,
                        ));
                        let _ = tray_window.set_always_on_top(true);
                        let _ = tray_window.show();
                        let _ = tray_window.set_focus();
                    }
                }
                _ => {}
            },
            _ => {}
        })
        .build(app);
    Ok(())
}

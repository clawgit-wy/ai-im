use base64::{engine::general_purpose, Engine as _};
use screenshots::Screen;
use std::cmp;
use std::thread;
use std::time::Duration;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, LogicalSize, Manager, Runtime};

/// 获取本地存储的用户信息（从 JSON 文件读取）
///
/// 返回用户信息的 JSON 字符串，如果文件不存在则返回空 JSON 对象 "{}"
#[tauri::command]
pub fn get_user_info<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = data_dir.join("user_info.json");

    if !file_path.exists() {
        // 文件不存在时返回空 JSON 对象
        return Ok("{}".to_string());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("读取用户信息文件失败: {}", e))?;
    Ok(content)
}

/// 保存用户信息到本地 JSON 文件
///
/// 接收前端传来的 JSON 字符串，直接写入 app_data_dir 下的 user_info.json
#[tauri::command]
pub fn save_user_info<R: Runtime>(user_info: String, app: AppHandle<R>) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    // 确保数据目录存在
    std::fs::create_dir_all(&data_dir)
        .map_err(|e| format!("创建数据目录失败: {}", e))?;

    let file_path = data_dir.join("user_info.json");
    std::fs::write(&file_path, &user_info)
        .map_err(|e| format!("写入用户信息文件失败: {}", e))?;
    Ok(())
}

/// 设置主窗口高度（不小于传入值）
///
/// 当窗口当前高度小于传入值时，将窗口高度调整为传入值
#[tauri::command]
pub fn set_height<R: Runtime>(height: u32, app: AppHandle<R>) {
    let home_window = match app.get_webview_window("home") {
        Some(w) => w,
        None => {
            eprintln!("未找到 home 窗口");
            return;
        }
    };

    let sf = match home_window.scale_factor() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("获取缩放因子失败: {}", e);
            return;
        }
    };

    let out_size = match home_window.outer_size() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("获取窗口尺寸失败: {}", e);
            return;
        }
    };

    let logical = out_size.to_logical(sf);
    let _ = home_window.set_size(LogicalSize::new(
        logical.width,
        cmp::max(logical.height, height),
    ));
}

/// 截图功能：截取主屏幕并返回 base64 编码的图片数据
#[tauri::command]
pub fn screenshot() -> Result<String, String> {
    // 获取所有屏幕，取主屏幕
    let screens = Screen::all().map_err(|e| format!("获取屏幕列表失败: {}", e))?;
    let screen = screens
        .first()
        .ok_or_else(|| "未找到可用屏幕".to_string())?;

    // 截取整个屏幕
    let image = screen
        .capture()
        .map_err(|e| format!("截屏失败: {}", e))?;

    // 将图片编码为 base64 字符串
    let buffer = image.buffer();
    let base64_str = general_purpose::STANDARD_NO_PAD.encode(buffer);
    Ok(base64_str)
}

/// 播放提示音
///
/// 根据传入的声音类型播放对应的音频文件
/// - "message": 消息提示音
/// - "notification": 通知提示音
/// - 其他: 默认提示音
#[tauri::command]
pub fn play_sound<R: Runtime>(sound_type: String, app: AppHandle<R>) -> Result<(), String> {
    // 根据声音类型映射到对应的音频文件
    let filename = match sound_type.as_str() {
        "message" => "message.mp3",
        "notification" => "notification.mp3",
        "call" => "call.mp3",
        _ => "default.mp3",
    };

    let path = format!("audio/{}", filename);
    let audio_path = app
        .path()
        .resolve(&path, BaseDirectory::Resource)
        .map_err(|e| format!("解析音频文件路径失败: {}", e))?;

    // 在独立线程中播放音频，避免阻塞主线程
    thread::spawn(move || {
        use rodio::{Decoder, OutputStream, Source};
        use std::fs::File;
        use std::io::BufReader;

        let audio_file = match File::open(&audio_path) {
            Ok(f) => f,
            Err(e) => {
                eprintln!("打开音频文件失败: {}", e);
                return;
            }
        };

        let file = BufReader::new(audio_file);

        // 获取默认音频输出流
        let (_stream, stream_handle) = match OutputStream::try_default() {
            Ok(s) => s,
            Err(e) => {
                eprintln!("获取音频输出设备失败: {}", e);
                return;
            }
        };

        // 解码音频文件
        let source = match Decoder::new(file) {
            Ok(s) => s,
            Err(e) => {
                eprintln!("解码音频文件失败: {}", e);
                return;
            }
        };

        // 播放音频
        if let Err(e) = stream_handle.play_raw(source.convert_samples()) {
            eprintln!("播放音频失败: {}", e);
            return;
        }

        // 等待音频播放完成（保持输出流存活）
        // _stream 在此作用域内必须存活，否则音频会被立即中断
        thread::sleep(Duration::from_millis(3000));
    });

    Ok(())
}

/// 获取应用版本号
#[tauri::command]
pub fn get_app_version<R: Runtime>(app: AppHandle<R>) -> String {
    app.package_info().version.to_string()
}

/// 切换 DevTools 开关
///
/// 在当前焦点窗口上打开或关闭开发者工具，便于调试。
/// 仅在 debug 模式或显式启用 devtools 时生效。
#[tauri::command]
pub fn toggle_devtools<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    // 优先获取当前焦点窗口，其次回退到 main 窗口
    let window = app
        .get_webview_window("main")
        .or_else(|| {
            app.webview_windows()
                .into_values()
                .find(|w| w.is_focused().unwrap_or(false))
        })
        .ok_or_else(|| "未找到可用窗口".to_string())?;

    if window.is_devtools_open() {
        window.close_devtools();
    } else {
        window.open_devtools();
    }
    Ok(())
}

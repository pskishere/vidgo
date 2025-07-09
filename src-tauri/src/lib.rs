use std::process::Command;
use tauri_plugin_autostart::MacosLauncher;

// 获取系统音量
#[tauri::command]
fn get_system_volume() -> Result<f32, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .arg("-e")
            .arg("output volume of (get volume settings)")
            .output()
            .map_err(|e| format!("Failed to get volume: {}", e))?;
        
        if output.status.success() {
            let volume_str = String::from_utf8(output.stdout)
                .map_err(|e| format!("Failed to read volume string: {}", e))?;
            let volume: f32 = volume_str.trim().parse().map_err(|e| format!("Failed to parse volume: {}", e))?;
            Ok(volume / 100.0) // 转换为 0-1 范围
        } else {
            Err("Failed to get system volume".to_string())
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows 实现 - 可以使用 PowerShell
        // 此处为简化实现，实际需要更复杂的脚本
        Ok(0.5)
    }
    
    #[cfg(target_os = "linux")]
    {
        let output = Command::new("pactl")
            .arg("get-sink-volume")
            .arg("@DEFAULT_SINK@")
            .output()
            .map_err(|e| format!("Failed to get volume: {}", e))?;
            
        if output.status.success() {
            let volume_str = String::from_utf8(output.stdout)
                .map_err(|e| format!("Failed to read volume string: {}", e))?;
            // 解析 pactl 输出
            if let Some(percent_pos) = volume_str.find('%') {
                if let Some(space_pos) = volume_str[..percent_pos].rfind(' ') {
                    let volume_num = &volume_str[space_pos + 1..percent_pos];
                    let volume: f32 = volume_num.parse().map_err(|e| format!("Failed to parse volume: {}", e))?;
                    return Ok(volume / 100.0);
                }
            }
        }
        Err("Failed to parse volume output".to_string())
    }
}

// 设置系统音量
#[tauri::command]
fn set_system_volume(volume: f32) -> Result<(), String> {
    let clamped_volume = volume.max(0.0).min(1.0);
    
    #[cfg(target_os = "macos")]
    {
        let volume_percent = (clamped_volume * 100.0) as i32;
        let script = format!("set volume output volume {}", volume_percent);
        
        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| format!("Failed to set volume: {}", e))
            .and_then(|status| if status.success() { Ok(()) } else { Err("Failed to set system volume".to_string()) })
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows 实现
        Ok(())
    }
    
    #[cfg(target_os = "linux")]
    {
        let volume_percent = (clamped_volume * 100.0) as i32;
        Command::new("pactl")
            .arg("set-sink-volume")
            .arg("@DEFAULT_SINK@")
            .arg(&format!("{}%", volume_percent))
            .status()
            .map_err(|e| format!("Failed to set volume: {}", e))
            .and_then(|status| if status.success() { Ok(()) } else { Err("Failed to set system volume".to_string()) })
    }
}

// 静音/取消静音
#[tauri::command]
fn toggle_system_mute() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("osascript")
            .arg("-e")
            .arg("output muted of (get volume settings)")
            .output()
            .map_err(|e| format!("Failed to get mute status: {}", e))?;
            
        if output.status.success() {
            let is_muted_str = String::from_utf8(output.stdout)
                .map_err(|e| format!("Failed to read mute status: {}", e))?;
            let is_muted = is_muted_str.trim() == "true";
            
            let script = if is_muted {
                "set volume with output unmuted"
            } else {
                "set volume with output muted"
            };
            
            Command::new("osascript")
                .arg("-e")
                .arg(script)
                .status()
                .map_err(|e| format!("Failed to toggle mute: {}", e))
                .and_then(|status| if status.success() { Ok(!is_muted) } else { Err("Failed to toggle system mute".to_string()) })
        } else {
            Err("Failed to get mute status".to_string())
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows 实现
        Ok(false)
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("pactl")
            .arg("set-sink-mute")
            .arg("@DEFAULT_SINK@")
            .arg("toggle")
            .status()
            .map_err(|e| format!("Failed to toggle mute: {}", e))?;
            
        let status_output = Command::new("pactl")
            .arg("get-sink-mute")
            .arg("@DEFAULT_SINK@")
            .output()
            .map_err(|e| format!("Failed to get mute status: {}", e))?;
            
        if status_output.status.success() {
            let status_str = String::from_utf8(status_output.stdout)
                .map_err(|e| format!("Failed to read mute status: {}", e))?;
            Ok(status_str.contains("yes"))
        } else {
            Err("Failed to get new mute status".to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--silently"])))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_system_volume,
            set_system_volume,
            toggle_system_mute
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

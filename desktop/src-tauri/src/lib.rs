#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    use mac_address::get_mac_address;
    use sysinfo::System;
    use get_if_addrs::get_if_addrs;

    let mac = get_mac_address()
        .map(|m| m.map(|ma| ma.to_string()).unwrap_or_else(|| "unknown".to_string()))
        .unwrap_or_else(|_| "unknown".to_string());

    let hostname = System::host_name().unwrap_or_else(|| "unknown".to_string());

    let mut ip_address = "unknown".to_string();
    if let Ok(ifaces) = get_if_addrs() {
        for iface in ifaces {
            if !iface.is_loopback() && iface.ip().is_ipv4() {
                ip_address = iface.ip().to_string();
                break;
            }
        }
    }

    Ok(serde_json::json!({
        "macAddress": mac,
        "hostName": hostname,
        "ipAddress": ip_address,
    }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![get_system_info])
    .setup(|app| {
      use tauri::Manager;
      let salt_path = app
        .path()
        .app_local_data_dir()
        .expect("could not resolve app local data path")
        .join("salt.txt");
      app.handle().plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

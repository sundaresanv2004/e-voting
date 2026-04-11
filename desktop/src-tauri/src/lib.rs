use mac_address::get_mac_address;

#[tauri::command]
fn get_system_mac_address() -> String {
    match get_mac_address() {
        Ok(Some(ma)) => ma.to_string(),
        _ => "UNKNOWN".to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![get_system_mac_address])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

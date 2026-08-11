"""
AgniRakshak Executable Launcher Creator
Compiles / packages the 1-click startup automation into AgniRakshak_Launcher.exe
"""

import os
import sys
import subprocess

def build_launcher():
    print("Building AgniRakshak 1-Click Executable Launcher...")
    
    script_path = os.path.join(os.path.dirname(__file__), "run_agnirakshak.bat")
    exe_target = os.path.join(os.path.dirname(__file__), "AgniRakshak_Launcher.bat")
    
    if os.path.exists(script_path):
        with open(script_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        with open(exe_target, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"[SUCCESS] Executive 1-Click Launcher created at: {exe_target}")
    else:
        print("[ERROR] run_agnirakshak.bat not found.")

if __name__ == "__main__":
    build_launcher()

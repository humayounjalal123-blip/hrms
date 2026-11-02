# Start local MariaDB for HRMS (if not already running)
$mysqld = "C:\Program Files\MariaDB 13.0\bin\mysqld.exe"
$defaults = '--defaults-file="C:/Program Files/MariaDB 13.0/data/my.ini"'

$listening = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if ($listening) {
  Write-Host "MariaDB already listening on port 3306."
  exit 0
}

if (-not (Test-Path $mysqld)) {
  Write-Host "MariaDB not found at $mysqld"
  Write-Host "Install MariaDB/XAMPP, or update this script path."
  exit 1
}

Write-Host "Starting MariaDB..."
Start-Process -FilePath $mysqld -ArgumentList $defaults -WindowStyle Hidden
Start-Sleep -Seconds 8

$ok = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if ($ok) {
  Write-Host "MariaDB is ready on 127.0.0.1:3306"
} else {
  Write-Host "Failed to start MariaDB. Check $env:TEMP\mysqld.err if present."
  exit 1
}

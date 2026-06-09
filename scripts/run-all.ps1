$root = "C:\Users\Administrateur\Documents\02 PUZZLE\cabinet-gyneco"
Set-Location $root

# Kill any existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start dev server in background job
$job = Start-Job -Name "dev-server" -ScriptBlock {
  param($d)
  Set-Location $d
  npm run dev
} -ArgumentList $root

# Wait for server to be ready
$ready = $false
for ($i = 0; $i -lt 40; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
  Start-Sleep -Seconds 5
}

if (-not $ready) {
  Write-Host "Server failed to start"
  exit 1
}

Write-Host "Server ready, running tests..."
node scripts/api-tests.mjs
$exitCode = $LASTEXITCODE

Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -ErrorAction SilentlyContinue
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

exit $exitCode

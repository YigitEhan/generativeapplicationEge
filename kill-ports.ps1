# Kill all processes on ports 3000 and 5173-5176

Write-Host "Killing processes on ports 3000, 5173-5176..." -ForegroundColor Yellow

function Kill-ProcessOnPort {
    param([int]$Port)
    
    $connections = netstat -ano | findstr ":$Port"
    if ($connections) {
        $connections | ForEach-Object {
            $line = $_.Trim()
            if ($line -match '\s+(\d+)$') {
                $pid = $Matches[1]
                if ($pid -ne "0") {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "  Killing $($process.ProcessName) (PID: $pid) on port $Port" -ForegroundColor Red
                            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        }
                    } catch {
                        # Process already dead
                    }
                }
            }
        }
    }
}

Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 5173
Kill-ProcessOnPort -Port 5174
Kill-ProcessOnPort -Port 5175
Kill-ProcessOnPort -Port 5176

Write-Host ""
Write-Host "Done! Ports are now free." -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan


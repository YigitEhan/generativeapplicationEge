# Startup script that kills existing processes on ports 3000 and 5173-5176
# Then starts the application

Write-Host "Checking for processes on ports 3000 and 5173-5176..." -ForegroundColor Cyan

# Function to kill process on a specific port
function Kill-ProcessOnPort {
    param([int]$Port)
    
    $connections = netstat -ano | findstr ":$Port"
    if ($connections) {
        $connections | ForEach-Object {
            $line = $_.Trim()
            if ($line -match '\s+(\d+)$') {
                $pid = $Matches[1]
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Killing process $($process.ProcessName) (PID: $pid) on port $Port" -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Milliseconds 500
                    }
                } catch {
                    # Process already dead or inaccessible
                }
            }
        }
    }
}

# Kill processes on all relevant ports
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 5173
Kill-ProcessOnPort -Port 5174
Kill-ProcessOnPort -Port 5175
Kill-ProcessOnPort -Port 5176

Write-Host ""
Write-Host "Ports cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting application..." -ForegroundColor Cyan
Write-Host ""

# Start the application
npm run dev


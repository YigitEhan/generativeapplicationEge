#!/bin/bash
# Startup script that kills existing processes on ports 3000 and 5173-5176
# Then starts the application

echo "🔍 Checking for processes on ports 3000 and 5173-5176..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    
    if [ ! -z "$pid" ]; then
        echo "  Killing process (PID: $pid) on port $port"
        kill -9 $pid 2>/dev/null
        sleep 0.5
    fi
}

# Kill processes on all relevant ports
kill_port 3000
kill_port 5173
kill_port 5174
kill_port 5175
kill_port 5176

echo ""
echo "✅ Ports cleared!"
echo ""
echo "🚀 Starting application..."
echo ""

# Start the application
npm run dev


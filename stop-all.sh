#!/bin/bash

# ProseProof - Stop Script
# Stops both backend and frontend services

# Get script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configuration defaults
DEFAULT_BACKEND_PORT=18001
DEFAULT_FRONTEND_PORT=15174

# Load environment variables from .env file (only if not already set)
if [ -f "$SCRIPT_DIR/.env" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        # Remove leading/trailing whitespace and quotes
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs | sed 's/^["'\'']//' | sed 's/["'\'']*$//')
        # Only set if not already set in environment
        case "$key" in
            BACKEND_PORT) [ -z "$BACKEND_PORT" ] && BACKEND_PORT="$value" ;;
            FRONTEND_PORT) [ -z "$FRONTEND_PORT" ] && FRONTEND_PORT="$value" ;;
            BACKEND_HOST) [ -z "$BACKEND_HOST" ] && BACKEND_HOST="$value" ;;
        esac
    done < "$SCRIPT_DIR/.env"
fi

# Apply defaults if still not set
BACKEND_PORT=${BACKEND_PORT:-$DEFAULT_BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT:-$DEFAULT_FRONTEND_PORT}

LOG_DIR="$SCRIPT_DIR/logs"
BACKEND_PID_FILE="$LOG_DIR/backend.pid"
FRONTEND_PID_FILE="$LOG_DIR/frontend.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop by PID file
stop_by_pid_file() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null)
        
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo -e "${BLUE}🛑 Stopping $service_name (PID: $pid)...${NC}"
            
            # Send graceful shutdown signal
            kill "$pid" 2>/dev/null
            
            # Wait for graceful shutdown (max 5 seconds)
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 5 ]; do
                sleep 1
                ((count++))
            done
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
                kill -9 "$pid" 2>/dev/null
            fi
            
            rm -f "$pid_file"
            echo -e "${GREEN}✅ $service_name stopped${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  $service_name not running (stale PID file removed)${NC}"
            rm -f "$pid_file"
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name not running (no PID file)${NC}"
        return 0
    fi
}

# Alternative: Kill by port if PID file missing
kill_by_port() {
    local port=$1
    local service_name=$2
    
    if command -v lsof &> /dev/null; then
        local pid=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$pid" ]; then
            echo -e "${YELLOW}⚠️  Found $service_name on port $port (PID: $pid), killing...${NC}"
            kill "$pid" 2>/dev/null
            sleep 1
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
            fi
            echo -e "${GREEN}✅ $service_name killed${NC}"
        fi
    fi
}

# Main execution
echo -e "${YELLOW}=================================${NC}"
echo -e "${YELLOW}   ProseProof - Stop Script${NC}"
echo -e "${YELLOW}=================================${NC}"
echo ""

# Stop frontend first (reverse order of startup)
stop_by_pid_file "frontend" "$FRONTEND_PID_FILE"

# Stop backend
stop_by_pid_file "backend" "$BACKEND_PID_FILE"

# Cleanup: Kill any lingering processes on our ports
echo ""
echo -e "${YELLOW}🔍 Checking for lingering processes...${NC}"
kill_by_port "$FRONTEND_PORT" "frontend"
kill_by_port "$BACKEND_PORT" "backend"

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}   ✅ All services stopped${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo -e "💡 ${YELLOW}Commands:${NC}"
echo "   - Start all:  ./launch-all.sh"
echo "   - View logs:  cat logs/backend.log logs/frontend.log"
echo ""

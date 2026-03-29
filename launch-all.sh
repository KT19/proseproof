#!/bin/bash

# ProseProof - Launch Script
# Starts both backend and frontend services in background

set -e

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
    echo "📄 Loaded environment variables from .env"
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
NC='\033[0m' # No Color

# Create logs directory
mkdir -p "$LOG_DIR"

# Function to check if port is in use
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i :$port &> /dev/null
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo -e "${YELLOW}🚀 Starting backend on port $BACKEND_PORT...${NC}"
    
    cd "$SCRIPT_DIR/backend"
    
    # Check if virtual environment exists (uv uses .venv by default)
    if [ ! -d ".venv" ]; then
        echo -e "${RED}❌ Virtual environment not found. Creating...${NC}"
        uv sync
    fi
    
    # Start uvicorn with --app-dir flag
    nohup .venv/bin/uvicorn app.main:app \
        --host "${BACKEND_HOST:-0.0.0.0}" \
        --port "$BACKEND_PORT" \
        --app-dir "$SCRIPT_DIR/backend" \
        > "$LOG_DIR/backend.log" 2>&1 &
    
    local pid=$!
    echo $pid > "$BACKEND_PID_FILE"
    cd "$SCRIPT_DIR"
    
    # Wait and verify backend started
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ Backend started (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend failed to start. Check $LOG_DIR/backend.log${NC}"
        rm -f "$BACKEND_PID_FILE"
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}🚀 Starting frontend on port $FRONTEND_PORT...${NC}"
    
    # Check if node_modules exists
    if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
        echo -e "${RED}❌ node_modules not found. Installing dependencies...${NC}"
        cd "$SCRIPT_DIR/frontend"
        npm install
        cd "$SCRIPT_DIR"
    fi
    
    # Set BACKEND_URL for frontend proxy
    export BACKEND_URL="http://localhost:${BACKEND_PORT}"
    
    cd "$SCRIPT_DIR/frontend"
    nohup npm run dev -- --port "$FRONTEND_PORT" \
        > "$LOG_DIR/frontend.log" 2>&1 &
    
    local pid=$!
    echo $pid > "$FRONTEND_PID_FILE"
    cd "$SCRIPT_DIR"
    
    # Wait and verify frontend started
    sleep 3
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend started (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend failed to start. Check $LOG_DIR/frontend.log${NC}"
        rm -f "$FRONTEND_PID_FILE"
        return 1
    fi
}

# Main execution
echo -e "${YELLOW}=================================${NC}"
echo -e "${YELLOW}   ProseProof - Launch Script${NC}"
echo -e "${YELLOW}=================================${NC}"
echo ""

# Start backend first
start_backend
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  Backend failed to start. Exiting.${NC}"
    exit 1
fi

sleep 1

# Then start frontend
start_frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  Frontend failed to start.${NC}"
    echo -e "${YELLOW}💡 Run ./stop-all.sh to clean up, then try again${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}   ✅ ProseProof is Running!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo -e "📝 ${YELLOW}Logs:${NC}"  
echo "   - Backend:  $LOG_DIR/backend.log"
echo "   - Frontend: $LOG_DIR/frontend.log"
echo ""
echo -e "🔗 ${YELLOW}Access:${NC}"
echo "   - Frontend: http://localhost:$FRONTEND_PORT"
echo "   - Backend:  http://localhost:$BACKEND_PORT"
echo ""
echo -e "💡 ${YELLOW}Commands:${NC}"
echo "   - Stop all:   ./stop-all.sh"
echo "   - View logs:  tail -f $LOG_DIR/backend.log $LOG_DIR/frontend.log"
echo "   - Check status: ps aux | grep -E 'uvicorn|vite'"
echo ""

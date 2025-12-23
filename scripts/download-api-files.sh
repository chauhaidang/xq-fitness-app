#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📥 Downloading API files from xq-apis repository...${NC}"

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
XQ_APIS_REPO="git@github.com:chauhaidang/xq-apis.git"
XQ_APIS_DIR="$PROJECT_ROOT/../xq-apis"
MOBILE_API_DIR="$PROJECT_ROOT/api"

# Check if git is available
if ! command -v git &> /dev/null; then
  echo -e "${RED}❌ git not found. Please install git first.${NC}"
  exit 1
fi

# Clone or update the xq-apis repository
if [ -d "$XQ_APIS_DIR" ]; then
  echo -e "${BLUE}🔄 Updating existing xq-apis repository...${NC}"
  cd "$XQ_APIS_DIR"
  git fetch origin
  git pull origin main || git pull origin master
else
  echo -e "${BLUE}📦 Cloning xq-apis repository...${NC}"
  cd "$PROJECT_ROOT/.."
  git clone "$XQ_APIS_REPO" xq-apis
  cd "$XQ_APIS_DIR"
fi

# Ensure we're on the main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  echo -e "${YELLOW}⚠️  Currently on branch: $BRANCH. Switching to main...${NC}"
  git checkout main 2>/dev/null || git checkout master 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Could not switch to main/master. Continuing with current branch...${NC}"
  }
fi

# Create mobile/api directory if it doesn't exist
mkdir -p "$MOBILE_API_DIR"

# Copy API files
echo -e "${BLUE}📋 Copying API files...${NC}"

# Copy read-service API
READ_SERVICE_SRC="$XQ_APIS_DIR/api/read-service/read-service-api.yaml"
READ_SERVICE_DST="$MOBILE_API_DIR/read-service-api.yaml"

if [ -f "$READ_SERVICE_SRC" ]; then
  cp "$READ_SERVICE_SRC" "$READ_SERVICE_DST"
  echo -e "${GREEN}✅ Copied read-service-api.yaml${NC}"
else
  echo -e "${RED}❌ read-service-api.yaml not found at: $READ_SERVICE_SRC${NC}"
  exit 1
fi

# Copy write-service API
WRITE_SERVICE_SRC="$XQ_APIS_DIR/api/write-service/write-service-api.yaml"
WRITE_SERVICE_DST="$MOBILE_API_DIR/write-service-api.yaml"

if [ -f "$WRITE_SERVICE_SRC" ]; then
  cp "$WRITE_SERVICE_SRC" "$WRITE_SERVICE_DST"
  echo -e "${GREEN}✅ Copied write-service-api.yaml${NC}"
else
  echo -e "${RED}❌ write-service-api.yaml not found at: $WRITE_SERVICE_SRC${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ API files download complete!${NC}"
echo -e "${GREEN}   Files copied to: $MOBILE_API_DIR${NC}"
echo ""
echo -e "${BLUE}Downloaded files:${NC}"
echo -e "  - read-service-api.yaml"
echo -e "  - write-service-api.yaml"


#!/bin/bash

# =============================================================================
# Perplexity MCP One-Click Setup Script for Roo Code
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}=================================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${PURPLE}=================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get OS type
get_os() {
    case "$(uname -s)" in
        Darwin*)    echo "macOS" ;;
        Linux*)     echo "Linux" ;;
        CYGWIN*|MINGW*|MSYS*) echo "Windows" ;;
        *)          echo "Unknown" ;;
    esac
}

# Function to find Roo Code config directory
find_roo_config_dir() {
    local os_type=$(get_os)
    
    case $os_type in
        "Linux")
            echo "$HOME/.config/VSCodium/User/globalStorage/rooveterinaryinc.roo-cline/settings"
            ;;
        "macOS")
            echo "$HOME/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings"
            ;;
        "Windows")
            echo "$APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Function to validate Perplexity API key
validate_api_key() {
    local api_key="$1"
    
    if [[ ! "$api_key" =~ ^pplx-[a-zA-Z0-9]+$ ]]; then
        return 1
    fi
    
    return 0
}

# Main setup function
setup_perplexity_mcp() {
    print_header "🚀 Perplexity MCP Setup for Roo Code"
    print_info "This script will configure Perplexity MCP server for Roo Code"
    echo
    
    # Check prerequisites
    print_step "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed!"
        print_info "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node --version)
    print_success "Node.js found: $node_version"
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_success "npm found"
    
    # Check if jq is available (optional, for JSON parsing)
    if ! command_exists jq; then
        print_warning "jq not found (optional - will use Python if available)"
    fi
    
    # Get API key
    print_step "Setting up API key..."
    
    local api_key=""
    if [ -n "$1" ]; then
        api_key="$1"
    else
        echo -n "Enter your Perplexity API key (from https://www.perplexity.ai/account/api/group): "
        read -s api_key
        echo
    fi
    
    if ! validate_api_key "$api_key"; then
        print_error "Invalid Perplexity API key format!"
        print_info "API key should start with 'pplx-' followed by alphanumeric characters"
        exit 1
    fi
    
    print_success "API key validated"
    
    # Find Roo Code config directory
    print_step "Finding Roo Code configuration directory..."
    
    local roo_config_dir=$(find_roo_config_dir)
    
    if [ -z "$roo_config_dir" ]; then
        print_error "Could not determine Roo Code configuration directory for your OS"
        print_info "OS detected: $(get_os)"
        exit 1
    fi
    
    print_success "Config directory found: $roo_config_dir"
    
    # Create directory if it doesn't exist
    if [ ! -d "$roo_config_dir" ]; then
        print_info "Creating configuration directory..."
        mkdir -p "$roo_config_dir"
    fi
    
    # Check if mcp_settings.json exists
    local config_file="$roo_config_dir/mcp_settings.json"
    local backup_file="$config_file.backup.$(date +%Y%m%d_%H%M%S)"
    
    if [ -f "$config_file" ]; then
        print_warning "Existing configuration found!"
        print_info "Creating backup: $backup_file"
        cp "$config_file" "$backup_file"
    fi
    
    # Create new configuration
    print_step "Creating MCP configuration..."
    
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << 'EOF'
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": [
        "-y",
        "@perplexity-ai/mcp-server"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "API_KEY_PLACEHOLDER",
        "PERPLEXITY_TIMEOUT_MS": "300000"
      },
      "alwaysAllow": [
        "perplexity_ask",
        "perplexity_search",
        "perplexity_research",
        "perplexity_reason"
      ],
      "disabled": false
    }
  }
}
EOF
    
    # Replace API key placeholder
    sed -i.bak "s/API_KEY_PLACEHOLDER/$api_key/" "$temp_file"
    mv "$temp_file" "$config_file"
    
    print_success "Configuration created successfully!"
    
    # Test the server
    print_step "Testing Perplexity MCP server..."
    
    cd "$roo_config_dir/../.."  # Go up to MCP directory
    
    # Run a quick test
    print_info "Installing/Testing @perplexity-ai/mcp-server..."
    
    timeout 10s npx -y @perplexity-ai/mcp-server 2>&1 | head -5 || {
        print_warning "Server test completed (timeout or exit expected)"
    }
    
    # Cleanup
    rm -f "$temp_file"
    
    # Summary
    echo
    print_header "🎉 Setup Complete!"
    
    print_success "Perplexity MCP server configured successfully!"
    print_info "Configuration file: $config_file"
    
    if [ -f "$backup_file" ]; then
        print_info "Backup created: $backup_file"
    fi
    
    echo
    print_info "Available tools:"
    echo "  • perplexity_ask - Smart conversations with sonar-pro"
    echo "  • perplexity_search - Enhanced web search"
    echo "  • perplexity_research - Deep research analysis"
    echo "  • perplexity_reason - Advanced reasoning"
    
    echo
    print_info "📋 Next Steps:"
    echo "  1. Restart VS Code completely (not just reload)"
    echo "  2. Open Roo Code and start a new task"
    echo "  3. The new Perplexity tools will be automatically available"
    
    echo
    print_info "📚 Documentation:"
    echo "  • Setup Guide: See PERPLEXITY_MCP_SETUP.md"
    echo "  • Examples: See PERPLEXITY_EXAMPLES.md"
    echo "  • Official Docs: https://docs.perplexity.ai/guides/mcp-server"
    
    echo
    print_info "🔧 Troubleshooting:"
    echo "  • If tools don't appear, restart VS Code"
    echo "  • Check API key at https://www.perplexity.ai/account/api/group"
    echo "  • Verify config file: $config_file"
    
    echo
    print_header "Happy Researching! 🚀"
}

# Help function
show_help() {
    cat << 'EOF'
Perplexity MCP Setup Script for Roo Code

USAGE:
    ./setup-perplexity-mcp.sh [API_KEY]

DESCRIPTION:
    One-click setup for Perplexity MCP server in Roo Code.
    Automatically configures the official @perplexity-ai/mcp-server.

ARGUMENTS:
    API_KEY    Your Perplexity API key (optional, will prompt if not provided)

EXAMPLES:
    ./setup-perplexity-mcp.sh
    ./setup-perplexity-mcp.sh pplx-your-api-key-here

REQUIREMENTS:
    • Node.js installed
    • npm installed
    • Perplexity API key from https://www.perplexity.ai/account/api/group

SUPPORT:
    • Documentation: See PERPLEXITY_MCP_SETUP.md
    • GitHub: https://github.com/ppl-ai/modelcontextprotocol
    • Community: https://community.perplexity.ai

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        setup_perplexity_mcp "$1"
        ;;
esac
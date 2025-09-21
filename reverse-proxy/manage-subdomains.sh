#!/bin/bash

# Subdomain Management Script
# This script allows you to add, remove, and list subdomain configurations

set -e

CONFIG_FILE="subdomains.conf"
DOMAIN_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  add <subdomain> <container:port> [--websocket]    Add a new subdomain configuration"
    echo "  remove <subdomain>                                Remove a subdomain configuration"
    echo "  list                                              List all configured subdomains"
    echo "  generate                                          Generate Caddyfile with current configs"
    echo "  help                                              Show this help message"
    echo ""
    echo "Options:"
    echo "  --websocket                                       Enable WebSocket-specific headers"
    echo ""
    echo "Examples:"
    echo "  $0 add api api-container:8080"
    echo "  $0 add admin admin-panel:3000"
    echo "  $0 add gamework gamework-signalling-server:8080 --websocket"
    echo "  $0 remove api"
    echo "  $0 list"
    echo "  $0 generate"
    echo ""
    echo "WebSocket Support:"
    echo "  Use --websocket flag to enable WebSocket-specific headers"
    echo "  This is required for signaling servers, real-time apps, and WebSocket services"
}

# Function to get domain from .env file
get_domain() {
    if [ -f "$DOMAIN_FILE" ]; then
        grep "^DOMAIN=" "$DOMAIN_FILE" | cut -d'=' -f2
    else
        echo "mydomain.com"
    fi
}

# Function to ensure subdomains.conf exists
ensure_config_file() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "📝 Creating $CONFIG_FILE..."
        cat > "$CONFIG_FILE" << EOF
# Subdomain Configuration File
# This file persists subdomain configurations across deployments
# Format: subdomain=container:port
# Example: api=api-container:8080

# Add your subdomain configurations here
# They will be automatically included in the generated Caddyfile

# Example configurations (uncomment and modify as needed):
# api=api-container:8080
# admin=admin-panel:3000
# blog=blog-app:80
# docs=documentation:4000
# status=status-page:8080
EOF
        echo "✅ Created $CONFIG_FILE with example configurations"
    fi
}

# Function to add subdomain
add_subdomain() {
    local subdomain="$1"
    local container_port="$2"
    local websocket_flag="$3"
    
    # Ensure config file exists
    ensure_config_file
    
    if [ -z "$subdomain" ] || [ -z "$container_port" ]; then
        echo -e "${RED}Error: Both subdomain and container:port are required${NC}"
        echo "Usage: $0 add <subdomain> <container:port> [--websocket]"
        exit 1
    fi
    
    # Validate container:port format
    if [[ ! "$container_port" =~ ^[a-zA-Z0-9_-]+:[0-9]+$ ]]; then
        echo -e "${RED}Error: Invalid container:port format. Use 'container-name:port'${NC}"
        exit 1
    fi
    
    # Check if subdomain already exists
    if grep -q "^$subdomain=" "$CONFIG_FILE" 2>/dev/null; then
        echo -e "${YELLOW}Warning: Subdomain '$subdomain' already exists${NC}"
        read -p "Do you want to update it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Remove existing entry
            sed -i "/^$subdomain=/d" "$CONFIG_FILE"
        else
            echo "Operation cancelled"
            exit 0
        fi
    fi
    
    # Add new entry with WebSocket support if flag is specified
    if [ "$websocket_flag" = "--websocket" ]; then
        echo "$subdomain=$container_port:websocket" >> "$CONFIG_FILE"
        echo -e "${GREEN}✅ Added subdomain: $subdomain -> $container_port (WebSocket enabled)${NC}"
    else
        echo "$subdomain=$container_port" >> "$CONFIG_FILE"
        echo -e "${GREEN}✅ Added subdomain: $subdomain -> $container_port${NC}"
    fi
    
    # Show full URL
    local domain=$(get_domain)
    echo -e "${BLUE}🌐 Full URL: https://$subdomain.$domain${NC}"
}

# Function to remove subdomain
remove_subdomain() {
    local subdomain="$1"
    
    # Ensure config file exists
    ensure_config_file
    
    if [ -z "$subdomain" ]; then
        echo -e "${RED}Error: Subdomain is required${NC}"
        echo "Usage: $0 remove <subdomain>"
        exit 1
    fi
    
    if grep -q "^$subdomain=" "$CONFIG_FILE" 2>/dev/null; then
        sed -i "/^$subdomain=/d" "$CONFIG_FILE"
        echo -e "${GREEN}✅ Removed subdomain: $subdomain${NC}"
    else
        echo -e "${YELLOW}Warning: Subdomain '$subdomain' not found${NC}"
    fi
}

# Function to list subdomains
list_subdomains() {
    local domain=$(get_domain)
    
    echo -e "${BLUE}📋 Configured Subdomains:${NC}"
    echo "Domain: $domain"
    echo ""
    
    # Ensure config file exists
    ensure_config_file
    
    if [ -f "$CONFIG_FILE" ] && [ -s "$CONFIG_FILE" ]; then
        # Filter out comments and empty lines
        local configs=$(grep -v '^#' "$CONFIG_FILE" | grep -v '^$' | grep '=')
        
        if [ -n "$configs" ]; then
            echo -e "${GREEN}Subdomain Configurations:${NC}"
            echo "┌─────────────┬─────────────────────┬─────────────┬─────────────────────────┐"
            echo "│ Subdomain   │ Container:Port      │ WebSocket   │ Full URL                │"
            echo "├─────────────┼─────────────────────┼─────────────┼─────────────────────────┤"
            
            while IFS='=' read -r subdomain container_port; do
                # Check if WebSocket is enabled
                if [[ "$container_port" == *":websocket" ]]; then
                    # Remove :websocket suffix for display
                    display_port="${container_port%:websocket}"
                    websocket_status="✅ Yes"
                else
                    display_port="$container_port"
                    websocket_status="❌ No"
                fi
                
                printf "│ %-11s │ %-19s │ %-11s │ https://%s.%-12s │\n" \
                    "$subdomain" "$display_port" "$websocket_status" "$subdomain" "$domain"
            done <<< "$configs"
            
            echo "└─────────────┴─────────────────────┴─────────────┴─────────────────────────┘"
        else
            echo -e "${YELLOW}No subdomain configurations found${NC}"
        fi
    else
        echo -e "${YELLOW}No subdomain configurations found${NC}"
    fi
}

# Function to generate Caddyfile
generate_caddyfile() {
    echo -e "${BLUE}🔧 Generating Caddyfile with subdomain configurations...${NC}"
    
    if [ -f "./generate-caddyfile.sh" ]; then
        ./generate-caddyfile.sh
        echo -e "${GREEN}✅ Caddyfile generated successfully${NC}"
    else
        echo -e "${RED}Error: generate-caddyfile.sh not found${NC}"
        exit 1
    fi
}

# Function to reload Caddy
reload_caddy() {
    echo -e "${BLUE}🔄 Reloading Caddy configuration...${NC}"
    
    if docker-compose ps | grep -q "Up"; then
        docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
        echo -e "${GREEN}✅ Caddy configuration reloaded${NC}"
    else
        echo -e "${YELLOW}Warning: Caddy container is not running${NC}"
        echo "Start it with: docker-compose up -d"
    fi
}

# Main script logic
case "$1" in
    "add")
        add_subdomain "$2" "$3" "$4"
        generate_caddyfile
        reload_caddy
        ;;
    "remove")
        remove_subdomain "$2"
        generate_caddyfile
        reload_caddy
        ;;
    "list")
        list_subdomains
        ;;
    "generate")
        generate_caddyfile
        ;;
    "reload")
        reload_caddy
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac

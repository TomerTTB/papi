#!/bin/bash

# Set API Configuration
EnableSLA=true  # Set to false to disable SLA monitoring

echo "Setting up environment variables..."

# SLA logging
if [ "$EnableSLA" = false ]; then
    export ENABLE_SLA_LOGS='false'
else
    export ENABLE_SLA_LOGS='true'
fi

export SLA_RESPONSE_TIME="1.6"  # seconds
export SSL_EXPIRY_THRESHOLD="210"  # Days before SSL expiration to trigger alert
export ITERATION="2" # minutes
export LOG_EXPIRY="6" # days of logs to keep

# SLA - Handle iteration timing (default 30 minutes if not specified)
if [ -z "$ITERATION" ]; then
    echo "No iteration time specified. Using default: 30 minutes"
else
    echo "Using specified iteration time: $ITERATION minutes"
fi

# Skip port checking in container mode
if [ -z "$inContainer" ]; then
    # Check if port 3000 is in use
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port 3000 is already in use. Attempting to free it..."
        if kill -9 $(lsof -ti:3000) 2>/dev/null; then
            echo "Successfully freed port 3000"
            sleep 2
        else
            echo "Failed to free port 3000. Please ensure no other application is using it."
            exit 1
        fi
    fi
    
    # Check if port 3001 is in use (SLA Monitor)
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port 3001 is already in use. Attempting to free it..."
        if kill -9 $(lsof -ti:3001) 2>/dev/null; then
            echo "Successfully freed port 3001"
            sleep 2
        else
            echo "Failed to free port 3001. Please ensure no other application is using it."
            exit 1
        fi
    fi
    
    # Check if port 8080 is in use
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port 8080 is already in use. Attempting to free it..."
        if kill -9 $(lsof -ti:8080) 2>/dev/null; then
            echo "Successfully freed port 8080"
            sleep 2
        else
            echo "Failed to free port 8080. Please ensure no other application is using it."
            exit 1
        fi
    fi
fi

# Environment Variables - Replace with your actual URLs
export BASE_URL="https://api-staging.example.com/staging/"
export STAGING="https://api-staging.example.com/staging/"
export BETA="https://api-beta.example.com/beta/"
export MUFASA="https://api-mufasa.example.com/mufasa/"
export SHAZAM="https://api-shazam.example.com/shazam/"
export MADEYE="https://api-madeye.example.com/madeye/"
export SANDBOX="https://api-sandbox.example.com/sandbox/"

# SLA Environment Variables
# Mock Server
# export BASE_URL_SLA_US="http://localhost:3003"

# US
export BASE_URL_SLA_US="https://api-staging.example.com/staging/"
export BASE_URL_PHI_SLA_US="https://api-staging.example.com/staging/"
export PHI_API_KEY_US="your-us-phi-api-key-here"

# EU
export BASE_URL_SLA_EU="https://api-staging.example.com/staging/"
export BASE_URL_PHI_SLA_EU="https://dev.api.example.com/staging/"
export PHI_API_KEY_EU="your-eu-phi-api-key-here"

# Slack Configuration for SLA - Replace with your webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
export SLACK_SUBTEAM_ID=""  # SLA monitor group ID, leave empty to disable mentions

# Amazon S3 - Replace with your S3 bucket URLs
export BASE_URL_ATTACHMENTS="https://your-staging-attachments.s3.amazonaws.com/"
export UPLOAD_ATTACHMENTS_STAGING="https://your-staging-attachments.s3.amazonaws.com/"
export UPLOAD_ATTACHMENTS_BETA="https://your-beta-attachments.s3.amazonaws.com/"
export UPLOAD_ATTACHMENTS_MUFASA="https://your-mufasa-attachments.s3.amazonaws.com/"
export UPLOAD_ATTACHMENTS_SHAZAM="https://your-shazam-attachments.s3.amazonaws.com/"
export UPLOAD_ATTACHMENTS_MADEYE="https://your-madeye-attachments.s3.amazonaws.com/"
export UPLOAD_ATTACHMENTS_SANDBOX="https://your-sandbox-attachments.s3.amazonaws.com/"

# PHI - Replace with your PHI URLs
export BASE_URL_PHI="https://dev.api.example.com/staging/"
export PHI_URL_STAGING="https://dev.api.example.com/staging/"
export PHI_URL_PREPROD="https://api.us.example.com/preprod/"

# Set environment variables - Replace with your actual values
export PAPI_VERSION="F2.1.0/T1.7.0/S1.8.0"
export GLASSESON_CLIENT_ID="your-client-id-here"
export GLASSESON_PROFILE_NAME="native_goeyes"
export GLASSESON_NATIVE_APP_ID="com.example.app"
export GLASSESON_FLOW_ID="go-eyes"
export GLASSESON_USER_ID="your-user-id-here"

# GoEyes-LM
export GLASSESON_CLIENT_ID_LM="your-lm-client-id-here"
export GLASSESON_PROFILE_NAME_LM="go_eyes_lm"
export GLASSESON_NATIVE_APP_ID_LM="com.example.wrapper"
export GLASSESON_FLOW_ID_LM="go-eyes-lm"
export GLASSESON_USER_ID_LM="your-lm-user-id-here"

# Attachments
export GLASSESON_NATIVE_APP_ID_ATTACHMENTS="com.example.wrapper"
export GLASSESON_SESSION_ID_ATTACHMENTS="aaaaaaaa-bbbb-cccc-dddd"
export GLASSESON_SAVE_ID_ATTACHMENTS="tteeeeee-ffff-gggg-hhhh"
export GLASSESON_FILE_TYPE_ATTACHMENTS="csv"
export X_API_KEY="your-x-api-key-here"

# PHI API Keys - Replace with your actual keys
export PHI_API_KEY="your-phi-api-key-here"
export PHI_API_KEY_PREPROD="your-preprod-phi-api-key-here"
export PHI_API_KEY_STAGING="your-staging-phi-api-key-here"

# PD
export GLASSESON_CLIENT_ID_PD="your-pd-client-id-here"
export GLASSESON_PROFILE_NAME_PD="web"
export GLASSESON_REFERER_PD="https://web.example.com"
export GLASSESON_NATIVE_APP_ID_PD_NATIVE="com.example.sdktester"
export GLASSESON_PROFILE_NAME_PD_NATIVE="go_lenses"
export GLASSESON_FLOW_ID_PD="pd"

# VA
export GLASSESON_CLIENT_ID_VA="your-va-client-id-here"
export GLASSESON_PROFILE_NAME_VA="va_web"
export GLASSESON_REFERER_VA="https://myrx.example.io"
export GLASSESON_FLOW_ID_VA="go-va"

echo "Environment variables set successfully!"

# Save the original directory
originalLocation=$(pwd)

# Function to handle cleanup on script termination
cleanup() {
    echo "Shutting down services..."
    # Kill background processes
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start API server in background
echo "Starting API server..."
(cd "$originalLocation" && npm run dev) &

# Wait a moment for the API server to start
sleep 2

# Start SLA monitoring in background (if enabled)
if [ "$EnableSLA" = true ]; then
    echo "Starting SLA monitoring..."
    (cd "$originalLocation" && npm run sla) &
    
    # Wait a moment for SLA monitoring to start
    sleep 2
else
    echo "SLA monitoring disabled"
fi

# Start web server in background
echo "Starting web interface..."
(cd "$originalLocation/web_server" && npm start) &

# Wait a moment for the web server to start
sleep 2

# Open web interface in browser only if not in container
if [ -z "$inContainer" ]; then
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:8080" 2>/dev/null || echo "Could not open browser automatically. Please navigate to http://localhost:8080 manually."
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:8080" 2>/dev/null || echo "Could not open browser automatically. Please navigate to http://localhost:8080 manually."
    else
        echo "Could not open browser automatically. Please navigate to http://localhost:8080 manually."
    fi
else
    echo "Running in container mode. Web interface available at http://localhost:8080"
fi

echo "All servers started successfully!"
echo "Press Ctrl+C to stop all servers"

# Keep the script running to prevent the container from exiting
if [ -n "$inContainer" ]; then
    echo "Container is running. Use Ctrl+C to stop."
    # Keep the container running
    while true; do
        sleep 10
    done
else
    # Wait for all background jobs to complete
    wait
fi
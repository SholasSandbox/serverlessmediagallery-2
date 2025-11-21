#!/bin/bash

# Media Gallery - Complete Testing Script
# This script tests the entire upload flow end-to-end

set -e  # Exit on error

STACK_NAME="${1:-media-gallery-dev}"
TEST_FILE="${2:-test-image.jpg}"

echo "=========================================="
echo "Media Gallery - End-to-End Test"
echo "=========================================="
echo "Stack: $STACK_NAME"
echo "Test File: $TEST_FILE"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Function to print info
info() {
    echo -e "${YELLOW}→${NC} $1"
}

# Check prerequisites
info "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    error "AWS CLI not found. Please install it first."
fi

if ! command -v jq &> /dev/null; then
    error "jq not found. Please install it: brew install jq (macOS) or apt-get install jq (Linux)"
fi

if ! command -v curl &> /dev/null; then
    error "curl not found. Please install it first."
fi

success "Prerequisites check passed"
echo ""

# Verify stack exists
info "Verifying CloudFormation stack..."
STACK_STATUS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STACK_STATUS" = "NOT_FOUND" ]; then
    error "Stack '$STACK_NAME' not found. Deploy it first with: aws cloudformation create-stack ..."
fi

if [ "$STACK_STATUS" != "CREATE_COMPLETE" ] && [ "$STACK_STATUS" != "UPDATE_COMPLETE" ]; then
    error "Stack is in status: $STACK_STATUS. Wait for it to complete."
fi

success "Stack status: $STACK_STATUS"
echo ""

# Get stack outputs
info "Getting stack outputs..."

UPLOAD_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`UploadEndpoint`].OutputValue' \
    --output text)

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`MediaTableName`].OutputValue' \
    --output text)

BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
    --output text)

if [ -z "$UPLOAD_URL" ] || [ -z "$TABLE_NAME" ] || [ -z "$BUCKET_NAME" ]; then
    error "Failed to get stack outputs"
fi

success "Upload URL: $UPLOAD_URL"
success "DynamoDB Table: $TABLE_NAME"
success "S3 Bucket: $BUCKET_NAME"
echo ""

# Create test file if it doesn't exist
if [ ! -f "$TEST_FILE" ]; then
    info "Creating test file: $TEST_FILE"
    echo "This is a test image file" > "$TEST_FILE"
    success "Test file created"
fi

# Test 1: Request pre-signed URL
info "Test 1: Requesting pre-signed upload URL..."

RESPONSE=$(curl -s -X POST "$UPLOAD_URL" \
    -H "Content-Type: application/json" \
    -d "{
        \"filename\": \"$TEST_FILE\",
        \"contentType\": \"image/jpeg\"
    }")

# Check if response is valid JSON
if ! echo "$RESPONSE" | jq . &> /dev/null; then
    error "Invalid JSON response from API: $RESPONSE"
fi

# Check for error in response
if echo "$RESPONSE" | jq -e '.error' &> /dev/null; then
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error')
    error "API returned error: $ERROR_MSG"
fi

PRESIGNED_URL=$(echo "$RESPONSE" | jq -r '.uploadUrl')
MEDIA_ID=$(echo "$RESPONSE" | jq -r '.mediaId')
EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expiresIn')

if [ -z "$PRESIGNED_URL" ] || [ "$PRESIGNED_URL" = "null" ]; then
    error "Failed to get pre-signed URL from response: $RESPONSE"
fi

success "Pre-signed URL received"
success "Media ID: $MEDIA_ID"
success "Expires in: ${EXPIRES_IN}s"
echo ""

# Test 2: Check initial DynamoDB record
info "Test 2: Verifying initial DynamoDB record..."

sleep 2  # Give DynamoDB a moment

DYNAMO_ITEM=$(aws dynamodb get-item \
    --table-name "$TABLE_NAME" \
    --key "{\"mediaId\": {\"S\": \"$MEDIA_ID\"}}" \
    --output json 2>/dev/null || echo '{}')

if [ "$(echo "$DYNAMO_ITEM" | jq -r '.Item.status.S')" != "UPLOADING" ]; then
    error "Initial DynamoDB record not found or status is not UPLOADING"
fi

success "Initial DynamoDB record created with status=UPLOADING"
echo ""

# Test 3: Upload file to S3
info "Test 3: Uploading file to S3 via pre-signed URL..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$PRESIGNED_URL" \
    -H "Content-Type: image/jpeg" \
    --upload-file "$TEST_FILE")

if [ "$HTTP_CODE" -ne 200 ]; then
    error "File upload failed with HTTP code: $HTTP_CODE"
fi

success "File uploaded successfully (HTTP $HTTP_CODE)"
echo ""

# Test 4: Verify S3 Processor updated DynamoDB
info "Test 4: Waiting for S3 Processor to finalize metadata..."

MAX_ATTEMPTS=10
ATTEMPT=0
FINAL_STATUS=""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
    
    DYNAMO_ITEM=$(aws dynamodb get-item \
        --table-name "$TABLE_NAME" \
        --key "{\"mediaId\": {\"S\": \"$MEDIA_ID\"}}" \
        --output json)
    
    FINAL_STATUS=$(echo "$DYNAMO_ITEM" | jq -r '.Item.status.S')
    
    if [ "$FINAL_STATUS" = "READY" ]; then
        success "Metadata finalized (status=READY)"
        break
    fi
    
    info "Waiting... (attempt $ATTEMPT/$MAX_ATTEMPTS, status=$FINAL_STATUS)"
done

if [ "$FINAL_STATUS" != "READY" ]; then
    error "S3 Processor did not update status to READY after ${MAX_ATTEMPTS} attempts"
fi

# Extract and display final metadata
FILE_SIZE=$(echo "$DYNAMO_ITEM" | jq -r '.Item.size.N')
CONTENT_TYPE=$(echo "$DYNAMO_ITEM" | jq -r '.Item.contentType.S')
S3_KEY=$(echo "$DYNAMO_ITEM" | jq -r '.Item.s3Key.S')

success "File size: $FILE_SIZE bytes"
success "Content type: $CONTENT_TYPE"
success "S3 key: $S3_KEY"
echo ""

# Test 5: Verify file exists in S3
info "Test 5: Verifying file in S3..."

S3_SIZE=$(aws s3api head-object \
    --bucket "$BUCKET_NAME" \
    --key "$S3_KEY" \
    --query 'ContentLength' \
    --output text 2>/dev/null || echo "0")

if [ "$S3_SIZE" -eq 0 ]; then
    error "File not found in S3"
fi

if [ "$S3_SIZE" -ne "$FILE_SIZE" ]; then
    error "File size mismatch: S3=$S3_SIZE, DynamoDB=$FILE_SIZE"
fi

success "File verified in S3 (size: $S3_SIZE bytes)"
echo ""

# Test 6: Check Lambda logs
info "Test 6: Checking Lambda execution logs..."

UPLOAD_LAMBDA="MediaGallery-Upload-${STACK_NAME#media-gallery-}"
PROCESSOR_LAMBDA="MediaGallery-S3Processor-${STACK_NAME#media-gallery-}"

UPLOAD_LOG_COUNT=$(aws logs describe-log-streams \
    --log-group-name "/aws/lambda/$UPLOAD_LAMBDA" \
    --query 'length(logStreams)' \
    --output text 2>/dev/null || echo "0")

PROCESSOR_LOG_COUNT=$(aws logs describe-log-streams \
    --log-group-name "/aws/lambda/$PROCESSOR_LAMBDA" \
    --query 'length(logStreams)' \
    --output text 2>/dev/null || echo "0")

if [ "$UPLOAD_LOG_COUNT" -gt 0 ]; then
    success "Upload Lambda executed ($UPLOAD_LOG_COUNT log streams)"
else
    error "No Upload Lambda logs found"
fi

if [ "$PROCESSOR_LOG_COUNT" -gt 0 ]; then
    success "S3 Processor Lambda executed ($PROCESSOR_LOG_COUNT log streams)"
else
    error "No S3 Processor Lambda logs found"
fi

echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}ALL TESTS PASSED!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  Media ID: $MEDIA_ID"
echo "  Status: $FINAL_STATUS"
echo "  File Size: $FILE_SIZE bytes"
echo "  S3 Location: s3://$BUCKET_NAME/$S3_KEY"
echo ""
echo "View full item in DynamoDB:"
echo "  aws dynamodb get-item --table-name $TABLE_NAME --key '{\"mediaId\": {\"S\": \"$MEDIA_ID\"}}'"
echo ""
echo "View file in S3:"
echo "  aws s3 cp s3://$BUCKET_NAME/$S3_KEY downloaded-$TEST_FILE"
echo ""
echo "View Lambda logs:"
echo "  aws logs tail /aws/lambda/$UPLOAD_LAMBDA --follow"
echo "  aws logs tail /aws/lambda/$PROCESSOR_LAMBDA --follow"
echo ""

# Cleanup option
read -p "Delete test file from S3? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    aws s3 rm "s3://$BUCKET_NAME/$S3_KEY"
    aws dynamodb delete-item --table-name "$TABLE_NAME" --key "{\"mediaId\": {\"S\": \"$MEDIA_ID\"}}"
    success "Test data cleaned up"
fi

exit 0

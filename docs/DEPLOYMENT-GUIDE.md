# Media Gallery CloudFormation Deployment Guide

## Prerequisites

1. **AWS CLI installed and configured:**
```bash
aws --version
aws sts get-caller-identity  # Verify credentials
```

2. **AWS Account with permissions to create:**
   - S3 buckets
   - DynamoDB tables
   - Lambda functions
   - API Gateway
   - IAM roles
   - CloudWatch logs

---

## Quick Start (5 Minutes)

### Step 1: Deploy the Stack

```bash
# Deploy with default settings
aws cloudformation create-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=dev

# Monitor deployment (takes 2-3 minutes)
aws cloudformation wait stack-create-complete \
  --stack-name media-gallery-dev

# Check status
aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].StackStatus'
```

### Step 2: Get API Endpoint

```bash
# Get the upload endpoint
aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UploadEndpoint`].OutputValue' \
  --output text

# Save to variable
UPLOAD_URL=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UploadEndpoint`].OutputValue' \
  --output text)

echo "Upload API: $UPLOAD_URL"
```

### Step 3: Test the API

```bash
# Test 1: Request pre-signed URL
curl -X POST $UPLOAD_URL \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-image.jpg",
    "contentType": "image/jpeg"
  }' | jq .

# You should get a response like:
# {
#   "uploadUrl": "https://s3.amazonaws.com/...",
#   "mediaId": "abc-123-def-456",
#   "expiresIn": 300
# }
```

### Step 4: Upload a File

```bash
# Save the response to variables
RESPONSE=$(curl -s -X POST $UPLOAD_URL \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.jpg", "contentType": "image/jpeg"}')

PRESIGNED_URL=$(echo $RESPONSE | jq -r '.uploadUrl')
MEDIA_ID=$(echo $RESPONSE | jq -r '.mediaId')

echo "Media ID: $MEDIA_ID"
echo "Upload URL: $PRESIGNED_URL"

# Upload a test file (create a dummy file if you don't have one)
echo "Test content" > test.jpg

curl -X PUT "$PRESIGNED_URL" \
  -H "Content-Type: image/jpeg" \
  --upload-file test.jpg

echo "✓ File uploaded!"
```

### Step 5: Verify in DynamoDB

```bash
# Wait a few seconds for S3 processor to run
sleep 5

# Check DynamoDB
TABLE_NAME=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaTableName`].OutputValue' \
  --output text)

aws dynamodb get-item \
  --table-name $TABLE_NAME \
  --key "{\"mediaId\": {\"S\": \"$MEDIA_ID\"}}" | jq .

# You should see status=READY with file metadata
```

---

## Advanced Deployment Options

### Custom Bucket Name

```bash
aws cloudformation create-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=MediaBucketName,ParameterValue=my-unique-bucket-name-12345
```

### Deploy to Different Regions

```bash
# Deploy to us-west-2
aws cloudformation create-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region us-west-2
```

### Production Deployment

```bash
aws cloudformation create-stack \
  --stack-name media-gallery-prod \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=prod
```

---

## Updating the Stack

```bash
# After modifying the Lambda code or template
aws cloudformation update-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=dev

# Wait for update
aws cloudformation wait stack-update-complete \
  --stack-name media-gallery-dev
```

---

## Monitoring & Debugging

### View Lambda Logs

```bash
# Upload Lambda logs
aws logs tail /aws/lambda/MediaGallery-Upload-dev --follow

# S3 Processor logs
aws logs tail /aws/lambda/MediaGallery-S3Processor-dev --follow
```

### Check API Gateway Logs

```bash
# Get API ID
API_ID=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text | cut -d'/' -f3 | cut -d'.' -f1)

# View logs
aws logs tail "/aws/apigateway/$API_ID" --follow
```

### Query DynamoDB

```bash
# List all media items
aws dynamodb scan \
  --table-name $TABLE_NAME \
  --max-items 10 | jq '.Items'

# Query by status
aws dynamodb query \
  --table-name $TABLE_NAME \
  --index-name StatusIndex \
  --key-condition-expression "#status = :status" \
  --expression-attribute-names '{"#status": "status"}' \
  --expression-attribute-values '{":status": {"S": "READY"}}' | jq .
```

---

## Cleanup

### Delete Stack (Removes Everything)

```bash
# Empty S3 bucket first (required)
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text)

aws s3 rm s3://$BUCKET_NAME --recursive

# Delete stack
aws cloudformation delete-stack --stack-name media-gallery-dev

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name media-gallery-dev
```

---

## Cost Monitoring

```bash
# Check current month costs for this stack
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://cost-filter.json

# Create cost-filter.json:
# {
#   "Tags": {
#     "Key": "Project",
#     "Values": ["MediaGallery"]
#   }
# }
```

---

## Common Issues & Solutions

### Issue 1: Stack Creation Fails

**Error:** "Bucket name already exists"

**Solution:** 
```bash
# Use a custom unique bucket name
aws cloudformation create-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=MediaBucketName,ParameterValue=my-media-$(uuidgen | tr '[:upper:]' '[:lower:]')
```

### Issue 2: CORS Error When Uploading

**Error:** "Access-Control-Allow-Origin" missing

**Solution:** Already configured in stack. If still having issues:
```bash
# Verify CORS configuration
BUCKET_NAME=$(aws cloudformation describe-stack-resource \
  --stack-name media-gallery-dev \
  --logical-resource-id MediaBucket \
  --query 'StackResourceDetail.PhysicalResourceId' \
  --output text)

aws s3api get-bucket-cors --bucket $BUCKET_NAME
```

### Issue 3: Lambda Permission Errors

**Error:** "AccessDenied"

**Solution:** Check IAM roles in CloudFormation console or:
```bash
aws cloudformation describe-stack-events \
  --stack-name media-gallery-dev \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

---

## Next Steps

1. **Add CloudFront** (Day 4-5):
   - Create CloudFront distribution
   - Point to API Gateway and S3
   - Enable caching

2. **Add Authentication** (Week 2):
   - Set up Cognito User Pool
   - Add API Gateway authorizer
   - Update CORS for your domain

3. **Build Frontend** (Week 2):
   - Create HTML/JS upload page
   - Host on S3 + CloudFront
   - Add media listing/viewing

4. **Add Features** (Week 3+):
   - Delete endpoint
   - Update metadata endpoint
   - Image thumbnails (add another Lambda)
   - Search functionality

---

## Architecture Verification

After deployment, verify the architecture matches your diagram:

✓ **Client Layer:** Can test with curl (simulates web/mobile clients)
✓ **API Layer:** API Gateway + Lambda deployed
✓ **Storage Layer:** S3 + DynamoDB + S3 Processor Lambda

**Test the complete flow:**
1. Request upload → Gets pre-signed URL ✓
2. Upload file → Goes directly to S3 ✓
3. S3 event → Triggers processor ✓
4. Processor → Updates DynamoDB ✓

---

## Production Checklist

Before going live:

- [ ] Set up custom domain in API Gateway
- [ ] Add Cognito authentication
- [ ] Restrict CORS to your domain only
- [ ] Enable AWS WAF on API Gateway
- [ ] Set up CloudWatch alarms
- [ ] Configure backup for DynamoDB
- [ ] Add Lambda reserved concurrency
- [ ] Set up budget alerts
- [ ] Enable CloudTrail logging
- [ ] Review IAM policies (least privilege)

---

## Support & Resources

- **AWS CloudFormation Docs:** https://docs.aws.amazon.com/cloudformation/
- **Troubleshooting:** Check CloudFormation Events in AWS Console
- **Costs:** Use AWS Cost Explorer with tag filters
- **Updates:** Modify YAML and run `update-stack` command

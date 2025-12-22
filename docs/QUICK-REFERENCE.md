# Media Gallery CloudFormation - Quick Reference

## 🚀 Day 1-3 Commands (In Order)

### Custom Domain Checklist (CloudFront + Route 53)
- Current: alias `media-gallery.mixidility.com` is on distribution `d1gozkixyrngl8.cloudfront.net` with cert `arn:aws:acm:us-east-1:464975959576:certificate/e7fdcdb7-0b5b-44cf-b300-fc63abd96fcb`.
- Cert in us-east-1 issued: `aws acm describe-certificate --region us-east-1 --certificate-arn arn:aws:acm:us-east-1:464975959576:certificate/e7fdcdb7-0b5b-44cf-b300-fc63abd96fcb --query "Certificate.Status"`
- Deploy routing stack (new distribution + DNS): `aws cloudformation deploy --region eu-west-2 --stack-name media-gallery-routing --template-file CloudFormation/media-gallery-routing.yml --capabilities CAPABILITY_NAMED_IAM --parameter-overrides HostedZoneId=Z0023584LDIJZCOHES5A GalleryFqdn=media-gallery.mixidility.com OriginBucketName=media-gallery-mixidility.com AcmCertificateArnUsEast1=arn:aws:acm:us-east-1:464975959576:certificate/e7fdcdb7-0b5b-44cf-b300-fc63abd96fcb`
- If reusing existing distribution: add alias `media-gallery.mixidility.com` + select cert above, then create A/AAAA alias records to the distribution (HZ `Z2FDTNDATAQYW2`).
- Verify: `dig media-gallery.mixidility.com +short` and `curl -I https://media-gallery.mixidility.com`.

### 1. Deploy Stack (2-3 minutes)
```bash
aws cloudformation create-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name media-gallery-dev
```

### 2. Get API Endpoint
```bash
aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UploadEndpoint`].OutputValue' \
  --output text
```

### 3. Test Upload
```bash
# Save endpoint
UPLOAD_URL=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UploadEndpoint`].OutputValue' \
  --output text)

# Request pre-signed URL
curl -X POST $UPLOAD_URL \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.jpg", "contentType": "image/jpeg"}' | jq .
```

### 4. Run Full Test
```bash
chmod +x test-deployment.sh
./test-deployment.sh media-gallery-dev
```

---

## 📊 Monitoring Commands

### Lambda Logs
```bash
# Upload Lambda
aws logs tail /aws/lambda/MediaGallery-Upload-dev --follow

# S3 Processor
aws logs tail /aws/lambda/MediaGallery-S3Processor-dev --follow
```

### DynamoDB Query
```bash
# Get table name
TABLE=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaTableName`].OutputValue' \
  --output text)

# List all items
aws dynamodb scan --table-name $TABLE | jq '.Items'

# Get specific item
aws dynamodb get-item --table-name $TABLE \
  --key '{"mediaId": {"S": "YOUR-MEDIA-ID"}}' | jq .
```

### S3 List Files
```bash
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text)

aws s3 ls s3://$BUCKET/uploads/ --recursive
```

---

## 🔄 Update Commands

### Update Lambda Code
```bash
# Modify the ZipFile section in media-gallery-stack.yaml
# Then update:
aws cloudformation update-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

### Update Configuration
```bash
# Change parameters
aws cloudformation update-stack \
  --stack-name media-gallery-dev \
  --template-body file://media-gallery-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=staging
```

---

## 🗑️ Cleanup Commands

### Delete Stack
```bash
# Empty bucket first (REQUIRED)
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name media-gallery-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text)

aws s3 rm s3://$BUCKET --recursive

# Delete stack
aws cloudformation delete-stack --stack-name media-gallery-dev

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name media-gallery-dev
```

---

## 🐛 Troubleshooting

### Stack Creation Failed
```bash
# View events
aws cloudformation describe-stack-events \
  --stack-name media-gallery-dev \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'

# Get error details
aws cloudformation describe-stack-events \
  --stack-name media-gallery-dev | jq '.StackEvents[] | select(.ResourceStatus | contains("FAILED"))'
```

### Lambda Errors
```bash
# Get recent errors from Upload Lambda
aws logs filter-log-events \
  --log-group-name /aws/lambda/MediaGallery-Upload-dev \
  --filter-pattern "ERROR" \
  --max-items 10

# Get recent errors from S3 Processor
aws logs filter-log-events \
  --log-group-name /aws/lambda/MediaGallery-S3Processor-dev \
  --filter-pattern "ERROR" \
  --max-items 10
```

### API Gateway Errors
```bash
# Enable detailed CloudWatch logs first, then:
API_ID=$(echo $UPLOAD_URL | cut -d'/' -f3 | cut -d'.' -f1)
aws logs tail /aws/apigateway/$API_ID --follow
```

---

## 💰 Cost Tracking

### Estimated Costs (Dev/Testing)
- Lambda: ~$0.20/month (1M free tier)
- DynamoDB: ~$0.25/month (25GB free tier)
- S3: ~$0.50/month (5GB free tier)
- API Gateway: ~$0.00 (1M free first year)

**Total: ~$1/month during development**

### Check Actual Costs
```bash
# This month's costs for the stack
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://filter.json

# filter.json:
# {"Tags": {"Key": "Project", "Values": ["MediaGallery"]}}
```

---

## 📈 Performance Metrics

### Lambda Invocations
```bash
# Upload Lambda invocations (last hour)
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=MediaGallery-Upload-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

### API Gateway Requests
```bash
API_ID=$(echo $UPLOAD_URL | cut -d'/' -f3 | cut -d'.' -f1)

aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=MediaGallery-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

---

## 🔐 Security Checklist

Before production:
```bash
# 1. Restrict CORS in CloudFormation template
# Change from '*' to your domain

# 2. Add API Gateway authentication
# Add Cognito authorizer in template

# 3. Enable encryption
# S3: Add ServerSideEncryptionConfiguration
# DynamoDB: Add SSESpecification

# 4. Set up AWS WAF
# Add AWS::WAFv2::WebACL resource

# 5. Enable CloudTrail
aws cloudtrail create-trail \
  --name media-gallery-audit \
  --s3-bucket-name your-cloudtrail-bucket
```

---

## 📝 Next Steps After Day 3

1. **Add List Endpoint** - Query DynamoDB for all media
2. **Add Get Endpoint** - Retrieve single media item
3. **Add Delete Endpoint** - Remove media
4. **Add CloudFront** - CDN for API and media
5. **Build Frontend** - HTML/JS upload interface
6. **Add Authentication** - Cognito integration

---

## 🎓 Learning Resources

- **CloudFormation Docs:** https://docs.aws.amazon.com/cloudformation/
- **Lambda Best Practices:** https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- **DynamoDB Design:** https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html
- **S3 Pre-signed URLs:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html

---

## ⚡ One-Liner Cheat Sheet

```bash
# Deploy
aws cloudformation create-stack --stack-name media-gallery-dev --template-body file://media-gallery-stack.yaml --capabilities CAPABILITY_NAMED_IAM && aws cloudformation wait stack-create-complete --stack-name media-gallery-dev

# Test
./test-deployment.sh media-gallery-dev

# Monitor
aws logs tail /aws/lambda/MediaGallery-Upload-dev --follow

# Delete
aws s3 rm s3://$(aws cloudformation describe-stacks --stack-name media-gallery-dev --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' --output text) --recursive && aws cloudformation delete-stack --stack-name media-gallery-dev
```

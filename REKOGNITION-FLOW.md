# Media Gallery - Rekognition Integration Flow

## Architecture Summary

Your CloudFormation stack (`lambda-layer.yml`) now includes AWS Rekognition for AI-powered image and video analysis.

## Complete Execution Flow

### Phase 1: Upload (Steps 1-8) - UNCHANGED
Same as current diagram: Browser → CloudFront → API Gateway → Upload Lambda → S3 (pre-signed URL)

### Phase 2: Processing Split by Media Type

After S3 upload completes, the flow splits into TWO paths:

---

## IMAGE PROCESSING PATH (Synchronous)

**Step 9:** S3 ObjectCreated Event → Triggers S3ProcessorLambda

**Step 10:** S3ProcessorLambda calls `s3:HeadObject` to get file metadata (size, content-type)

**Step 11:** S3ProcessorLambda → `rekognition:DetectLabels` (SYNC call)
- Reads image bytes from S3
- Sends to Rekognition
- Waits for response (~1-3 seconds)

**Step 12:** Rekognition returns labels with confidence scores
- Example: `[{"Name": "Cat", "Confidence": 98.5}, {"Name": "Pet", "Confidence": 95.2}]`

**Step 13:** S3ProcessorLambda → DynamoDB `UpdateItem`
- Status: UPLOADING → READY
- Stores top 5 labels (confidence > 50%)
- Adds fileSize, contentType, processedAt timestamp

**Total Image Processing Time:** ~5-10 seconds

---

## VIDEO PROCESSING PATH (Asynchronous)

**Step 9:** S3 ObjectCreated Event → Triggers S3ProcessorLambda

**Step 10:** S3ProcessorLambda calls `s3:HeadObject` to get file metadata

**Step 11:** S3ProcessorLambda → `rekognition:StartLabelDetection` (ASYNC call)
- Submits video processing job to Rekognition
- Provides SNS Topic ARN for completion notification
- Returns JobId immediately
- Lambda function completes (doesn't wait)

**Step 12:** S3ProcessorLambda → DynamoDB `UpdateItem`
- Status: UPLOADING → READY
- Stores fileSize, contentType
- Labels empty (will be added later)

**Step 13:** Rekognition processes video in background (2-10 minutes)
- Analyzes frames
- Detects labels throughout video
- Aggregates results with timestamps

**Step 14:** Rekognition Job Complete → Publishes to SNS Topic
- Message includes JobId and S3ObjectName

**Step 15:** SNS Topic → SQS Queue
- SNS fans out completion notification
- SQS buffers messages for reliable processing

**Step 16:** VideoResultsLambda polls SQS Queue
- Triggered by EventSourceMapping (batch size: 5)
- Receives completion notification

**Step 17:** VideoResultsLambda → `rekognition:GetLabelDetection`
- Uses JobId to retrieve results
- Paginates through all detected labels
- Filters by confidence threshold (> 60%)
- Keeps top 5-8 labels by confidence

**Step 18:** VideoResultsLambda → DynamoDB `UpdateItem`
- Adds labels to existing media record
- Updates processedAt timestamp

**Total Video Processing Time:** 2-10 minutes (background, doesn't block user)

---

## Components Added to Architecture

### New AWS Services:
1. **AWS Rekognition** - AI/ML service for image and video analysis
2. **SNS Topic** (`RekVideoTopic`) - Notification channel for video job completion
3. **SQS Queue** (`RekVideoQueue`) - Buffer for completion notifications
4. **IAM Role** (`RekVideoTopicPublishRole`) - Allows Rekognition to publish to SNS

### New Lambda Functions:
1. **VideoAnalysisLambda** - (ALTERNATIVE trigger, not used in current flow)
   - Can be triggered directly by S3 for videos
   - Starts Rekognition jobs
   - Currently S3ProcessorLambda handles both images and videos

2. **VideoResultsLambda** - Processes completed video analysis
   - Polls SQS queue
   - Retrieves Rekognition results
   - Updates DynamoDB

### Modified Lambda Functions:
1. **S3ProcessorLambda** - Now handles BOTH images and videos
   - Detects content-type
   - Image: Synchronous `DetectLabels` call
   - Video: Asynchronous `StartLabelDetection` call

### IAM Permissions Added:
```
S3ProcessorLambdaRole:
  - rekognition:DetectLabels
  - rekognition:StartLabelDetection
  - iam:PassRole (for RekVideoTopicPublishRole)

VideoResultsLambdaRole:
  - rekognition:GetLabelDetection
  - sqs:ReceiveMessage
  - sqs:DeleteMessage
  - sqs:GetQueueAttributes
  - dynamodb:UpdateItem
```

---

## Configuration Parameters

### Image Processing:
- **MIN_LABEL_CONFIDENCE:** 50% (configurable)
- **MAX_LABELS:** 5 (configurable)
- **ALLOWED_LABELS:** Empty (allow all) or comma-separated list

### Video Processing:
- **VideoMinLabelConfidence:** 60% (CloudFormation parameter)
- **VideoMaxLabels:** 5 (CloudFormation parameter)
- **VideoAllowedLabels:** "Dancing,Dance,Performance,Concert,Music,Walking,Running,Jumping"

---

## Data Flow Summary

```
Upload:    Browser → API → S3
Metadata:  S3 → Lambda → DynamoDB (UPLOADING)

IMAGE:     S3 → S3ProcessorLambda → Rekognition (sync) → DynamoDB (READY + labels)

VIDEO:     S3 → S3ProcessorLambda → Rekognition (async) → SNS → SQS →
           VideoResultsLambda → Rekognition (get results) → DynamoDB (add labels)
```

---

## DynamoDB Schema with Labels

```json
{
  "objectKey": "uploads/abc-123-cat.jpg",
  "filename": "cat.jpg",
  "contentType": "image/jpeg",
  "status": "READY",
  "fileSize": 245678,
  "createdAt": "2025-01-15T10:30:00Z",
  "processedAt": "2025-01-15T10:30:05Z",
  "labels": ["Cat", "Pet", "Animal", "Mammal", "Whiskers"]
}
```

---

## Performance Metrics

| Metric | Image | Video |
|--------|-------|-------|
| API Response | ~100-200ms | ~100-200ms |
| Upload Time | Network-dependent | Network-dependent |
| Label Detection | 1-3 seconds (sync) | 2-10 minutes (async) |
| Total User Wait | ~5-10 seconds | Upload complete immediately |
| Metadata Finalized | ~5-10 seconds | 2-10 minutes (background) |

---

## How to Update the Diagram

### Option 1: Add to existing SMG-execution-flow.drawio

1. Open `SMG-execution-flow.drawio` in Draw.io (https://app.diagrams.net)
2. Add a new swimlane called "AI/ML Layer (Rekognition)"
3. Add AWS Rekognition, SNS, and SQS icons
4. Add flows:
   - IMAGE PATH: Processor Lambda → Rekognition → back to Lambda → DynamoDB
   - VIDEO PATH: Processor Lambda → Rekognition → SNS → SQS → VideoResults Lambda → DynamoDB

### Option 2: Use existing Media-gallery-with-Rekognition.drawio

The file `Media-gallery-with-Rekognition.drawio` already exists in your repository and likely contains a complete architecture diagram with Rekognition.

---

## Testing the Integration

### Test Image Upload:
```bash
aws s3 cp test-image.jpg s3://an-image-gallery-olu-2025-abcxyz/uploads/

# Check DynamoDB for labels
aws dynamodb scan --table-name media-gallery-metadata \
  --filter-expression "contains(objectKey, :key)" \
  --expression-attribute-values '{":key":{"S":"test-image.jpg"}}'
```

### Test Video Upload:
```bash
aws s3 cp test-video.mp4 s3://an-image-gallery-olu-2025-abcxyz/uploads/

# Check SQS queue for completion message (after 2-10 minutes)
aws sqs receive-message --queue-url <RekVideoQueue-URL>
```

---

## Cost Considerations

### Rekognition Pricing (as of 2025):
- **Images:** $1.00 per 1,000 images analyzed
- **Videos:** $0.10 per minute of video analyzed
- **First 1 million images/month:** Free tier eligible

### Example Monthly Cost:
- 10,000 images: $10
- 100 videos (5 min each): $50
- **Total: ~$60/month**

---

## Next Steps

1. ✅ Rekognition integration is complete in CloudFormation
2. Update the execution flow diagram with the two paths (image vs video)
3. Test with sample images and videos
4. Configure label filtering based on your use case
5. Add search functionality in frontend to filter by detected labels

#!/usr/bin/env bash
set -euo pipefail

TABLE="media-gallery-metadata"
BUCKET="an-image-gallery-olu-2025-abcxyz"
REGION="eu-west-2"
DRY_RUN=false   # set to false to actually delete

echo "Scanning DynamoDB for objectKey values..."
aws dynamodb scan \
  --table-name "$TABLE" \
  --projection-expression "objectKey" \
  --region "$REGION" \
  --query 'Items[].objectKey.S' \
  --output text |
while read -r key; do
  [ -z "$key" ] && continue
  echo
  echo "Checking $key"
  if aws s3api head-object --bucket "$BUCKET" --key "$key" --region "$REGION" >/dev/null 2>&1; then
    echo "  exists -> keep"
  else
    echo "  missing in S3 -> delete from DynamoDB"
    if [ "$DRY_RUN" = false ]; then
      aws dynamodb delete-item \
        --table-name "$TABLE" \
        --key "{\"objectKey\":{\"S\":\"$key\"}}" \
        --region "$REGION"
    fi
  fi
  echo
done

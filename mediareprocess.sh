#!/usr/bin/env bash
set -euo pipefail

BUCKET="an-image-gallery-olu-2025-abcxyz"
REGION="eu-west-2"

aws s3api list-objects-v2 --bucket "$BUCKET" --query 'Contents[].Key' --output text |
tr '\t' '\n' |
while read -r key; do
  [ -z "$key" ] && continue
  echo
  echo "Reprocessing $key"
  echo
  # fetch content type to preserve it
  CT=$(aws s3api head-object --bucket "$BUCKET" --key "$key" --region "$REGION" --query 'ContentType' --output text 2>/dev/null || echo "application/octet-stream")
  # copy to self with metadata replace (required by S3 when source=dest)
  aws s3api copy-object \
    --bucket "$BUCKET" \
    --copy-source "$BUCKET/$key" \
    --key "$key" \
    --metadata-directive REPLACE \
    --content-type "$CT" \
    --region "$REGION"
  echo "  -> copied to self (triggered ObjectCreated)"
done

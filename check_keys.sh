#!/usr/bin/env bash
set -euo pipefail

BUCKET="an-image-gallery-olu-2025-abcxyz"
REGION="eu-west-2"

keys=(
  "uploads/a565d25b-c2e3-499e-a580-46fb1212d843-YellowDragonFruit.jpg"
  "system-test.jpg"
  "uploads/54c304af-c249-4417-985d-2103f4f97eb8-sample.jpg"
  "test.jpg"
  "uploads/4b040e9c-6024-47d0-a6ee-b40da4e88894-pears.jpg"
  "uploads/682369a3-c338-4f36-9b82-37380a76bdf3-sample.jpg"
  "uploads/475ed72e-d544-47bf-8ed8-f6ac5f9b7125-sample-3.jpg"
  "uploads/6e763d15-5c82-4dd0-b8f3-378ef7ea6a63-bee_pollen.mov"
  "20251101_004405_846c7a5d_passionfruit.jpg"
  "test_2.jpg"
  "uploads/204977f0-9c80-4e80-be7d-24a1f7733a5e-tomato1.jpg"
  "uploads/799640b7-a8c1-4ad6-9f9f-4a9179c2b731-sample-1.jpg"
  "test_3.jpg"
  "20251101_004841_f62278ec_plantdragonfruit.jpg"
  "uploads/7496dc01-ab7e-4bb1-a659-282b2187d8a0-YellowDragonFruit.jpg"
  "uploads/bc13e84d-86ef-401d-9576-cc4f39599afa-sample.jpg"
  "uploads/73ee48d4-24ce-4b65-b9e7-a2aba9a52a8c-sample-1.jpg"
  "uploads/f733fc54-60fa-49ae-8930-082f377dcaad-YellowDragonFruit.jpg"
  "uploads/0c87a342-967d-41de-93f9-e25c3d65f357-sample-3.jpg"
  "bee_pollen.mov"
)

for k in "${keys[@]}"; do
  echo "Checking $k"
  echo
  if aws s3api head-object --bucket "$BUCKET" --key "$k" --region "$REGION" >/dev/null 2>&1; then
    echo "  exists"
    echo
  else
    echo "  missing"
    echo
  fi
done

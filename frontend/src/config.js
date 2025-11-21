export const API_CONFIG = {
  uploadEndpoint:
    import.meta.env.VITE_API_UPLOAD_URL ||
    'https://your-api.execute-api.us-east-1.amazonaws.com/dev/upload',
  mediaEndpoint:
    import.meta.env.VITE_API_MEDIA_URL ||
    'https://your-api.execute-api.us-east-1.amazonaws.com/dev/media',
};

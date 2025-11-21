import { format, formatDistanceToNow } from 'date-fns';

export function formatFileSize(bytes = 0) {
  if (!bytes || Number.isNaN(bytes)) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch (err) {
    return String(value);
  }
}

export function formatAbsoluteDate(value) {
  if (!value) return '';
  try {
    return format(new Date(value), 'PPpp');
  } catch (err) {
    return String(value);
  }
}

export function formatDuration(seconds = 0) {
  if (!Number.isFinite(seconds)) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

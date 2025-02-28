import { ObjectId } from 'mongodb';

// Generate room code with ambiguous characters removed
export function generateRoomCode(): string {
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Excluded 0, O, 1, I, L
  const codeLength = 6;
  return Array.from({ length: codeLength }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
}

// Sanitize user input to prevent XSS
export function sanitizeMessage(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .substring(0, 500); // Limit message length
}

// Validate room ID format
export function isValidRoomId(roomId: string): boolean {
  return /^[A-HJ-KM-NP-Z2-9]{6}$/.test(roomId);
}

// Convert MongoDB document to plain object
export function docToObj<T>(doc: T & { _id: ObjectId }): T {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() } as T;
}

// Format file sizes human-readable
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
}

// Generate expiration dates with buffer
export function getExpirationDate(hours = 24): Date {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}
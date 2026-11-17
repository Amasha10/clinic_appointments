// Shared form validation rules. Limits mirror the backend models so users see
// problems before a request is sent. Each validator returns an error message or ''.

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const limits = {
  userName: 80,
  doctorName: 100,
  specialty: 100,
  email: 254,
  phone: 30,
  description: 1000,
  reason: 500,
  passwordMin: 8,
  passwordMax: 100,
  imageBytes: 3 * 1024 * 1024,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Letters (any language), spaces, and . ' - only.
const PERSON_NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;
// Optional leading +, then digits with optional spaces, dashes, or parentheses.
const PHONE_CHARS_PATTERN = /^\+?[\d\s()-]+$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateName(value: string, label = 'Name', max: number = limits.userName) {
  const name = value.trim();
  if (!name) return `${label} is required.`;
  if (name.length < 2) return `${label} must be at least 2 characters.`;
  if (name.length > max) return `${label} must be ${max} characters or fewer.`;
  if (!PERSON_NAME_PATTERN.test(name)) return `${label} can only contain letters, spaces, and . ' -`;
  return '';
}

export function validateRequiredText(value: string, label: string, max: number, min = 1) {
  const text = value.trim();
  if (!text) return `${label} is required.`;
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  if (text.length > max) return `${label} must be ${max} characters or fewer.`;
  return '';
}

export function validateOptionalText(value: string, label: string, max: number) {
  return value.trim().length > max ? `${label} must be ${max} characters or fewer.` : '';
}

export function validateEmail(value: string, { required = true } = {}) {
  const email = value.trim();
  if (!email) return required ? 'Email is required.' : '';
  if (email.length > limits.email) return `Email must be ${limits.email} characters or fewer.`;
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, e.g. name@example.com.';
  return '';
}

export function validatePassword(value: string) {
  if (!value) return 'Password is required.';
  if (value.length < limits.passwordMin) return `Password must be at least ${limits.passwordMin} characters.`;
  if (value.length > limits.passwordMax) return `Password must be ${limits.passwordMax} characters or fewer.`;
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password must include at least one letter and one number.';
  return '';
}

export function validatePasswordConfirmation(password: string, confirmation: string) {
  if (!confirmation) return 'Confirm your password.';
  return password === confirmation ? '' : 'Passwords do not match.';
}

export function validatePhone(value: string, { required = false } = {}) {
  const phone = value.trim();
  if (!phone) return required ? 'Phone number is required.' : '';
  if (phone.length > limits.phone) return `Phone number must be ${limits.phone} characters or fewer.`;
  if (!PHONE_CHARS_PATTERN.test(phone) || phone.indexOf('+') > 0) {
    return 'Phone number can only contain digits, spaces, dashes, brackets, and a leading +.';
  }
  const digits = phone.replace(/\D/g, '');
  // E.164 allows at most 15 digits; 9 covers the shortest common mobile numbers.
  if (digits.length < 9 || digits.length > 15) return 'Enter a valid phone number with 9 to 15 digits, e.g. +94 77 123 4567.';
  return '';
}

/** Keeps only characters that can appear in a phone number. */
export function sanitizePhoneInput(value: string) {
  return value.replace(/[^\d\s()+-]/g, '');
}

/** Parses a strict YYYY-MM-DDTHH:mm value, rejecting rolled-over dates like 2026-02-31. */
export function parseDateTime(value: string) {
  const text = value.trim();
  if (!DATE_TIME_PATTERN.test(text)) return null;
  const [datePart, timePart] = text.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  const matches = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    && date.getHours() === hour && date.getMinutes() === minute;
  return matches ? date : null;
}

export function validateAppointmentTimes(startAt: string, endAt: string) {
  const errors: FieldErrors<'startAt' | 'endAt'> = {};
  const start = startAt.trim() ? parseDateTime(startAt) : null;
  const end = endAt.trim() ? parseDateTime(endAt) : null;

  if (!startAt.trim()) errors.startAt = 'Start time is required.';
  else if (!start) errors.startAt = 'Use the format YYYY-MM-DDTHH:mm with a real date and time.';
  else if (start <= new Date()) errors.startAt = 'Start time must be in the future.';

  if (!endAt.trim()) errors.endAt = 'End time is required.';
  else if (!end) errors.endAt = 'Use the format YYYY-MM-DDTHH:mm with a real date and time.';
  else if (start && end <= start) errors.endAt = 'End time must be after the start time.';
  else if (start && end.getTime() - start.getTime() > 8 * 60 * 60 * 1000) errors.endAt = 'An appointment cannot be longer than 8 hours.';

  return { errors, start, end };
}

export function validateImage(asset: { mimeType?: string | null; fileSize?: number | null; uri: string } | null) {
  if (!asset) return '';
  const type = asset.mimeType || guessImageType(asset.uri);
  if (type && !IMAGE_TYPES.includes(type)) return 'Photo must be a JPG, PNG, or WebP image.';
  if (asset.fileSize && asset.fileSize > limits.imageBytes) return 'Photo must be 3 MB or smaller.';
  return '';
}

function guessImageType(uri: string) {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return '';
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

/** Drops empty messages so the object only holds real errors. */
export function compactErrors<K extends string>(errors: Record<K, string>): FieldErrors<K> {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as FieldErrors<K>;
}

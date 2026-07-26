export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 10 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
}

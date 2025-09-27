export function maskEmail(email: string): string {
  if (!email) return '';
  return email.replace(/(.{2}).+(@.+)/, '$1***$2');
}

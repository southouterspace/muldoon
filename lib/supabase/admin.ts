/**
 * Check if an email address is an admin email.
 * Compares against the ADMIN_EMAIL environment variable.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return false;
  }

  return email.toLowerCase() === adminEmail.toLowerCase();
}

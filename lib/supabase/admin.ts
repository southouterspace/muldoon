/**
 * Check if an email address is an admin email.
 * Compares against the ADMIN_EMAILS environment variable (comma-separated list).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    return false;
  }

  const emailList = adminEmails.split(",").map((e) => e.trim().toLowerCase());
  return emailList.includes(email.toLowerCase());
}

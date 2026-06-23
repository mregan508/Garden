export function formatAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return (
      'Invalid email or password. Check that your account exists in the Supabase "gardening" project ' +
      '(Authentication → Users) with Auto Confirm enabled, and that the email matches exactly.'
    );
  }

  if (/email rate limit exceeded/i.test(message)) {
    return (
      'Supabase hit its email send limit (~3/hour on free plans). ' +
      'Turn off "Confirm email" under Authentication → Sign In / Providers → Email, click Save changes, then wait up to an hour before signing up again. ' +
      'Or add a user manually under Authentication → Users → Add user to skip email entirely.'
    );
  }

  return message;
}

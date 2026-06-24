export const STAY_SIGNED_IN_PREF_KEY = 'garden_stay_signed_in';

export function readStaySignedInPreference(stored: string | null | undefined): boolean {
  if (stored === 'false') return false;
  return true;
}

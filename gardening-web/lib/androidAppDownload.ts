import { basePath } from './basePath';

export const ANDROID_APP_FILENAME = 'garden-map.apk';

/** Pin to a tagged release — GitHub's /releases/latest/ skips pre-releases. */
const GITHUB_APK_URL =
  'https://github.com/mregan508/Garden/releases/download/v1.0.2/garden-map.apk';

/** URL for the sideload Android APK (env override, then GitHub release, then local static file). */
export function getAndroidAppDownloadUrl(): string {
  const configured = process.env.NEXT_PUBLIC_ANDROID_APP_DOWNLOAD_URL?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'development') {
    return `${basePath}/downloads/${ANDROID_APP_FILENAME}`;
  }

  return GITHUB_APK_URL;
}

// CI sets ANDROID_VERSION_CODE (the workflow run number) so every build uploaded
// to Google Play has a higher versionCode than the last, as Play requires.
const versionCodeOverride = Number.parseInt(process.env.ANDROID_VERSION_CODE ?? '', 10);

export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(Number.isInteger(versionCodeOverride) && versionCodeOverride > 0
      ? { versionCode: versionCodeOverride }
      : {}),
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsVersion: '11.23.1',
      },
    ],
  ],
});

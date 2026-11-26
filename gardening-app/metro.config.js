const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const appModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  appModules,
  path.resolve(workspaceRoot, 'node_modules'),
];
// Dedupe React for @gardening/shared without breaking nested dependency lookup (e.g. semver).
config.resolver.extraNodeModules = {
  react: path.join(appModules, 'react'),
  'react-dom': path.join(appModules, 'react-dom'),
  'react-native': path.join(appModules, 'react-native'),
  'react/jsx-runtime': path.join(appModules, 'react/jsx-runtime'),
  'react/jsx-dev-runtime': path.join(appModules, 'react/jsx-dev-runtime'),
};

// Packages with native code must come from the app's node_modules, because that is the
// copy compiled into the Android build. npm auto-installs @gardening/shared's peer
// dependencies into packages/shared/node_modules (e.g. AsyncStorage 3.x while the app
// links 2.x); bundling that copy breaks session storage, so every request runs signed out.
const APP_ONLY_PACKAGES = ['@react-native-async-storage/async-storage'];
const appOrigin = path.join(projectRoot, 'package.json');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const pinned = APP_ONLY_PACKAGES.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`)
  );
  return context.resolveRequest(
    pinned ? { ...context, originModulePath: appOrigin } : context,
    moduleName,
    platform
  );
};

module.exports = config;

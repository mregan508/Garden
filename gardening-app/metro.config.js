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
// Force a single React instance for the app and @gardening/shared (avoids "useState of null").
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  react: path.join(appModules, 'react'),
  'react-dom': path.join(appModules, 'react-dom'),
  'react-native': path.join(appModules, 'react-native'),
  'react/jsx-runtime': path.join(appModules, 'react/jsx-runtime'),
  'react/jsx-dev-runtime': path.join(appModules, 'react/jsx-dev-runtime'),
};

module.exports = config;

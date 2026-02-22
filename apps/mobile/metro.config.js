const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: '@bookfelt/mobile',
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
  },
};

// Apply Nx metro config (workspace resolution, watchFolders, pnpm support)
const nxConfig = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  debug: false,
  extensions: [],
  watchFolders: [],
});

// Save Nx's resolver, then remove it so NativeWind doesn't capture it
// in its closure (which would create a circular resolver chain)
const nxResolveRequest = nxConfig.resolver.resolveRequest;
delete nxConfig.resolver.resolveRequest;

// Restore projectRoot to app directory — Nx sets it to workspaceRoot which
// breaks NativeWind's virtual module path matching in the transformer
nxConfig.projectRoot = __dirname;

// Apply NativeWind (originalResolver will be undefined,
// so it uses context.resolveRequest as fallback)
const finalConfig = withNativeWind(nxConfig, { input: './global.css' });

// Compose resolvers: NativeWind (CSS interception) → Nx (pnpm/tsconfig) → Metro default
const nwResolveRequest = finalConfig.resolver.resolveRequest;
finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  return nwResolveRequest(
    {
      ...context,
      resolveRequest: (ctx, name, plat) => {
        const { resolveRequest: _, ...cleanCtx } = ctx;
        return nxResolveRequest(cleanCtx, name, plat);
      },
    },
    moduleName,
    platform,
  );
};

module.exports = finalConfig;

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Reanimated plugin is included in babel-preset-expo for Expo SDK 54
    ],
  };
};

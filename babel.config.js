module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // other plugins (if any) go above
      "react-native-reanimated/plugin", // must be last
    ],
  };
};

module.exports = {
  dependencies: {
    'react-native-vision-camera-text-recognition': {
      platforms: {
        ios: null, // ML Kit lacks arm64 simulator slices
      },
    },
  },
};

module.exports = {
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
      setValue: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    View: 'Animated.View',
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  },
};

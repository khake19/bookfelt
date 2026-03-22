/**
 * Mock for react-native-purchases
 */

export const mockCustomerInfo = (isPremium: boolean) => ({
  entitlements: {
    active: isPremium ? { premium: {} } : {},
  },
});

export const mockPurchases = {
  addCustomerInfoUpdateListener: jest.fn(),
  getCustomerInfo: jest.fn(),
};

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    addCustomerInfoUpdateListener: mockPurchases.addCustomerInfoUpdateListener,
    getCustomerInfo: mockPurchases.getCustomerInfo,
  },
}));

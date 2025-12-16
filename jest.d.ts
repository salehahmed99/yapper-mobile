/**
 * Type declarations for global test mocks defined in jest.setup.ts
 *
 * Note: We use jest.Mock (from @types/jest) instead of Mock from jest-mock
 * because jest.fn() returns jest.Mock type, and the two Mock types are incompatible.
 */
declare global {
  // Navigation mocks
  var mockNavigate: jest.Mock;
  var mockReplace: jest.Mock;
  var mockGoBack: jest.Mock;
  var mockDismissTo: jest.Mock;

  // Router mocks
  var mockUseLocalSearchParams: jest.Mock;
}

export {};

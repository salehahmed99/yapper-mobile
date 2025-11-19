import ReCaptcha, { ReCaptchaRef } from '@/src/components/ReCaptcha';
import { Theme } from '@/src/constants/theme';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock WebView
jest.mock('react-native-webview', () => ({
  WebView: jest.fn(() => null),
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  X: () => null,
}));

const mockTheme: Theme = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    overlayDark: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    md: 12,
    xl: 24,
    xxxl: 32,
  },
  typography: {
    sizes: {
      md: 16,
    },
  },
  borderRadius: {
    lg: 8,
  },
} as unknown as Theme;

describe('ReCaptcha', () => {
  const mockOnVerify = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';
    process.env.EXPO_PUBLIC_RECAPTCHA_SITE_URL = 'https://example.com';
  });

  it('should render modal when open is called', async () => {
    const ref = React.createRef<ReCaptchaRef>();

    render(<ReCaptcha ref={ref} siteKey="test-key" onVerify={mockOnVerify} themeColors={mockTheme} />);

    ref.current?.open();

    await waitFor(() => {
      // Verify modal is visible by checking for loading indicator
      expect(screen.getByText('Loading verification...')).toBeTruthy();
    });
  });

  it('should hide modal when close is called', async () => {
    const ref = React.createRef<ReCaptchaRef>();

    render(<ReCaptcha ref={ref} siteKey="test-key" onVerify={mockOnVerify} themeColors={mockTheme} />);

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Loading verification...')).toBeTruthy();
    });

    ref.current?.close();

    await waitFor(() => {
      expect(screen.queryByText('Loading verification...')).toBeFalsy();
    });
  });

  it('should support different sizes', () => {
    const { rerender, UNSAFE_getByType } = render(
      <ReCaptcha siteKey="test-key" onVerify={mockOnVerify} size="compact" themeColors={mockTheme} />,
    );

    const component = UNSAFE_getByType(ReCaptcha);
    expect(component.props.size).toBe('compact');

    rerender(<ReCaptcha siteKey="test-key" onVerify={mockOnVerify} size="invisible" themeColors={mockTheme} />);

    const updatedComponent = UNSAFE_getByType(ReCaptcha);
    expect(updatedComponent.props.size).toBe('invisible');
  });

  it('should support light and dark themes', () => {
    const darkTheme = {
      ...mockTheme,
      colors: { ...mockTheme.colors, background: { primary: '#000000', secondary: '#1a1a1a' } },
    };

    const { rerender, UNSAFE_getByType } = render(
      <ReCaptcha siteKey="test-key" onVerify={mockOnVerify} theme="light" themeColors={mockTheme} />,
    );

    const component = UNSAFE_getByType(ReCaptcha);
    expect(component.props.theme).toBe('light');

    rerender(
      <ReCaptcha siteKey="test-key" onVerify={mockOnVerify} theme="dark" themeColors={darkTheme as unknown as Theme} />,
    );

    const updatedComponent = UNSAFE_getByType(ReCaptcha);
    expect(updatedComponent.props.theme).toBe('dark');
  });

  it('should support different languages', () => {
    const { rerender, UNSAFE_getByType } = render(
      <ReCaptcha siteKey="test-key" onVerify={mockOnVerify} lang="en" themeColors={mockTheme} />,
    );

    const component = UNSAFE_getByType(ReCaptcha);
    expect(component.props.lang).toBe('en');

    rerender(<ReCaptcha siteKey="test-key" onVerify={mockOnVerify} lang="es" themeColors={mockTheme} />);

    const updatedComponent = UNSAFE_getByType(ReCaptcha);
    expect(updatedComponent.props.lang).toBe('es');
  });

  it('should handle close button press', async () => {
    const ref = React.createRef<ReCaptchaRef>();

    render(
      <ReCaptcha ref={ref} siteKey="test-key" onVerify={mockOnVerify} onClose={mockOnClose} themeColors={mockTheme} />,
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Loading verification...')).toBeTruthy();
    });

    ref.current?.close();

    await waitFor(() => {
      expect(screen.queryByText('Loading verification...')).toBeFalsy();
    });
  });

  it('should have correct displayName', () => {
    expect(ReCaptcha.displayName).toBe('ReCaptcha');
  });

  it('should render with default props', () => {
    const { UNSAFE_getByType } = render(<ReCaptcha siteKey="test-key" onVerify={mockOnVerify} />);

    const component = UNSAFE_getByType(ReCaptcha);
    expect(component.props.siteKey).toBe('test-key');
    expect(component.props.onVerify).toBeDefined();
  });
});

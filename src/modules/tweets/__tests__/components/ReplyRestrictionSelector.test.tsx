import { ThemeProvider } from '@/src/context/ThemeContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ReplyRestrictionSelector from '../../components/ReplyRestrictionSelector';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock icons
jest.mock('@/src/components/icons/GlobeIcon', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'globe-icon' });
  },
}));
jest.mock('@/src/components/icons/VerifiedIcon', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'verified-icon' });
  },
}));
jest.mock('@/src/components/icons/AccountCheckIcon', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'account-check-icon' });
  },
}));
jest.mock('@/src/components/icons/EmailIcon', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'email-icon' });
  },
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params: any) => {
      console.log('t called with:', key, params);
      const translations: Record<string, string> = {
        'tweets.replyRestriction.options.everyone': 'Everyone can reply',
        'tweets.replyRestriction.options.verifiedAccounts': 'Verified accounts can reply',
        'tweets.replyRestriction.options.accountsYouFollow': 'Accounts you follow can reply',
        'tweets.replyRestriction.options.onlyAccountsYouMention': 'Only accounts you mention can reply',
      };
      if (key === 'tweets.replyRestriction.canReply') {
        return params?.selection || key;
      }
      return translations[key] || key;
    },
  }),
}));

describe('ReplyRestrictionSelector', () => {
  it('should render correctly with Everyone option', () => {
    const { getByText } = renderWithTheme(<ReplyRestrictionSelector onPress={() => {}} selectedOption={0} />);
    expect(getByText('Everyone can reply')).toBeTruthy();
  });

  it('should render correctly with Verified accounts option', () => {
    const { getByText } = renderWithTheme(<ReplyRestrictionSelector onPress={() => {}} selectedOption={1} />);
    expect(getByText('Verified accounts can reply')).toBeTruthy();
  });

  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithTheme(<ReplyRestrictionSelector onPress={onPress} selectedOption={0} />);

    fireEvent.press(getByTestId('create_post_reply_restriction_selector'));
    expect(onPress).toHaveBeenCalled();
  });
});

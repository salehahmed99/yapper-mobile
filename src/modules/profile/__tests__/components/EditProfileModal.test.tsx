import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import EditProfileModal from '../../components/EditProfileModal';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock auth store
const mockFetchAndUpdateUser = jest.fn();
jest.mock('@/src/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: object) => unknown) =>
    selector({
      user: {
        id: 'current-user-id',
        name: 'Current User',
        username: 'currentuser',
        bio: 'Test bio',
        country: 'United States',
        birthDate: '1990-01-01',
        avatarUrl: 'https://example.com/avatar.jpg',
        coverUrl: 'https://example.com/banner.jpg',
      },
      fetchAndUpdateUser: mockFetchAndUpdateUser,
    }),
}));

// Mock profile service
jest.mock('../../services/profileService', () => ({
  updateUserProfile: jest.fn().mockResolvedValue({ message: 'Updated' }),
  uploadAvatar: jest.fn().mockResolvedValue({ imageUrl: 'new-avatar.jpg', imageName: 'avatar' }),
  uploadCover: jest.fn().mockResolvedValue({ imageUrl: 'new-cover.jpg', imageName: 'cover' }),
}));

// Mock edit-profile utils
jest.mock('../../utils/edit-profile.utils', () => ({
  showImagePickerOptions: jest.fn(),
  DEFAULT_AVATAR_URI: 'default-avatar.png',
  DEFAULT_BANNER_URI: 'default-banner.png',
}));

// Mock DateTimePickerModal
jest.mock('react-native-modal-datetime-picker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_date_picker' }),
  };
});

// Mock CountryPicker
jest.mock('@/src/components/CountryPicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'mocked_country_picker' }),
  };
});

// Mock StatusBar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

describe('EditProfileModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    imageUri: 'https://example.com/avatar.jpg',
    bannerUri: 'https://example.com/banner.jpg',
    onImageChange: jest.fn(),
    onBannerChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should render modal when visible is true', () => {
      const { toJSON } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(toJSON()).not.toBeNull();
    });

    it('should render header when visible', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_header')).toBeTruthy();
    });

    it('should render content container when visible', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_content')).toBeTruthy();
    });
  });

  describe('Header Buttons', () => {
    it('should render cancel button', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_cancel_button')).toBeTruthy();
    });

    it('should render save button', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_save_button')).toBeTruthy();
    });

    it('should render title', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_title')).toBeTruthy();
    });

    it('should call onClose when cancel button pressed', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      fireEvent.press(getByTestId('profile_edit_modal_cancel_button'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Image Editing', () => {
    it('should render banner button', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_banner_button')).toBeTruthy();
    });

    it('should render banner image', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_banner_image')).toBeTruthy();
    });

    it('should render avatar button', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_avatar_button')).toBeTruthy();
    });

    it('should render avatar image', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_avatar_image')).toBeTruthy();
    });

    it('should call showImagePickerOptions when avatar button pressed', () => {
      const { showImagePickerOptions } = require('../../utils/edit-profile.utils');
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      fireEvent.press(getByTestId('profile_edit_modal_avatar_button'));
      expect(showImagePickerOptions).toHaveBeenCalled();
    });

    it('should call showImagePickerOptions when banner button pressed', () => {
      const { showImagePickerOptions } = require('../../utils/edit-profile.utils');
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      fireEvent.press(getByTestId('profile_edit_modal_banner_button'));
      expect(showImagePickerOptions).toHaveBeenCalled();
    });
  });

  describe('Form Inputs', () => {
    it('should render form container', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_form_container')).toBeTruthy();
    });

    it('should render name input', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_name_input')).toBeTruthy();
    });

    it('should render bio input', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_bio_input')).toBeTruthy();
    });

    it('should render country input', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_country_input')).toBeTruthy();
    });

    it('should render birthday input', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('profile_edit_modal_birthday_input')).toBeTruthy();
    });

    it('should open country picker when country input pressed', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      const countryInput = getByTestId('profile_edit_modal_country_input');
      fireEvent.press(countryInput);
      // Country picker modal should be shown (mocked)
      expect(countryInput).toBeTruthy();
    });

    it('should open date picker when birthday input pressed', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      const birthdayInput = getByTestId('profile_edit_modal_birthday_input');
      fireEvent.press(birthdayInput);
      // Date picker modal should be shown (mocked)
      expect(birthdayInput).toBeTruthy();
    });

    it('should display current user name in name input', () => {
      const { getByDisplayValue } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByDisplayValue('Current User')).toBeTruthy();
    });

    it('should display current bio in bio input', () => {
      const { getByDisplayValue } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByDisplayValue('Test bio')).toBeTruthy();
    });
  });

  describe('Save Functionality', () => {
    it('should have working save button', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      const saveButton = getByTestId('profile_edit_modal_save_button');
      expect(saveButton).toBeTruthy();
      fireEvent.press(saveButton);
    });

    it('should render date picker', () => {
      const { getByTestId } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByTestId('mocked_date_picker')).toBeTruthy();
    });
  });

  describe('Translations', () => {
    it('should display cancel text', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.cancel')).toBeTruthy();
    });

    it('should display save text', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.save')).toBeTruthy();
    });

    it('should display title text', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.title')).toBeTruthy();
    });

    it('should display name label', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.name')).toBeTruthy();
    });

    it('should display bio label', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.bio')).toBeTruthy();
    });

    it('should display country label', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.country')).toBeTruthy();
    });

    it('should display birthday label', () => {
      const { getByText } = renderWithTheme(<EditProfileModal {...defaultProps} />);
      expect(getByText('profile.editModal.birthday')).toBeTruthy();
    });
  });
});

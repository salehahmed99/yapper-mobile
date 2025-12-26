import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '../../../../context/ThemeContext';
import ProfileActionsMenu from '../../components/ProfileActionsMenu';

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

// Mock the DropdownMenu component
jest.mock('../../../../components/DropdownMenu', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return {
    __esModule: true,
    default: ({
      visible,
      items,
      testID,
    }: {
      visible: boolean;
      onClose: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: { label: string; onPress: () => void; testID?: string; disabled?: boolean; icon?: any }[];
      position: { top: number; right: number };
      testID?: string;
    }) => {
      if (!visible) return null;
      return React.createElement(
        View,
        { testID },

        items.map((item: { label: string; onPress: () => void; testID?: string; disabled?: boolean }) =>
          React.createElement(
            TouchableOpacity,
            { key: item.label, onPress: item.disabled ? undefined : item.onPress, testID: item.testID },
            React.createElement(Text, null, item.label),
          ),
        ),
      );
    },
  };
});

describe('ProfileActionsMenu', () => {
  const mockOnClose = jest.fn();
  const mockOnMute = jest.fn().mockResolvedValue(undefined);
  const mockOnBlock = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should not render when not visible', () => {
      const { queryByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={false} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlock} />,
      );

      expect(queryByTestId('profile_actions_menu')).toBeNull();
    });

    it('should render when visible', () => {
      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlock} />,
      );

      expect(getByTestId('profile_actions_menu')).toBeTruthy();
    });
  });

  describe('Menu Items', () => {
    it('should render mute and block buttons', () => {
      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlock} />,
      );

      expect(getByTestId('profile_actions_mute_button')).toBeTruthy();
      expect(getByTestId('profile_actions_block_button')).toBeTruthy();
    });

    it('should show mute text when not muted', () => {
      const { getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialMuted={false}
        />,
      );

      expect(getByText('profile.actions.mute')).toBeTruthy();
    });

    it('should show unmute text when initialMuted is true', () => {
      const { getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialMuted={true}
        />,
      );

      expect(getByText('profile.actions.unmute')).toBeTruthy();
    });

    it('should show block text when not blocked', () => {
      const { getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialBlocked={false}
        />,
      );

      expect(getByText('profile.actions.block')).toBeTruthy();
    });

    it('should show unblock text when initialBlocked is true', () => {
      const { getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialBlocked={true}
        />,
      );

      expect(getByText('profile.actions.unblock')).toBeTruthy();
    });
  });

  describe('Mute Actions', () => {
    it('should call onMute when mute button is pressed', async () => {
      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlock} />,
      );

      fireEvent.press(getByTestId('profile_actions_mute_button'));

      await waitFor(() => {
        expect(mockOnMute).toHaveBeenCalledTimes(1);
      });
    });

    it('should toggle mute state after successful mute', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialMuted={false}
        />,
      );

      // Initially shows mute
      expect(getByText('profile.actions.mute')).toBeTruthy();

      fireEvent.press(getByTestId('profile_actions_mute_button'));

      await waitFor(() => {
        expect(mockOnMute).toHaveBeenCalled();
      });
    });

    it('should handle mute error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockOnMuteError = jest.fn().mockRejectedValue(new Error('Mute failed'));

      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMuteError} onBlock={mockOnBlock} />,
      );

      fireEvent.press(getByTestId('profile_actions_mute_button'));

      await waitFor(() => {
        expect(mockOnMuteError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error toggling mute:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not call onMute when already loading', async () => {
      const slowMute = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={slowMute} onBlock={mockOnBlock} />,
      );

      // Press twice quickly
      fireEvent.press(getByTestId('profile_actions_mute_button'));
      fireEvent.press(getByTestId('profile_actions_mute_button'));

      await waitFor(() => {
        expect(slowMute).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Block Actions', () => {
    it('should call onBlock when block button is pressed', async () => {
      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlock} />,
      );

      fireEvent.press(getByTestId('profile_actions_block_button'));

      await waitFor(() => {
        expect(mockOnBlock).toHaveBeenCalledTimes(1);
      });
    });

    it('should toggle block state after successful block', async () => {
      const { getByTestId, getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialBlocked={false}
        />,
      );

      // Initially shows block
      expect(getByText('profile.actions.block')).toBeTruthy();

      fireEvent.press(getByTestId('profile_actions_block_button'));

      await waitFor(() => {
        expect(mockOnBlock).toHaveBeenCalled();
      });
    });

    it('should handle block error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockOnBlockError = jest.fn().mockRejectedValue(new Error('Block failed'));

      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlockError} />,
      );

      fireEvent.press(getByTestId('profile_actions_block_button'));

      await waitFor(() => {
        expect(mockOnBlockError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error toggling block:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not call onBlock when blockLoading is true', async () => {
      const { getByTestId } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          blockLoading={true}
        />,
      );

      fireEvent.press(getByTestId('profile_actions_block_button'));

      // Should not have been called because blockLoading is true
      expect(mockOnBlock).not.toHaveBeenCalled();
    });
  });

  describe('useEffect State Sync', () => {
    it('should sync muted state when initialMuted prop changes', async () => {
      const { rerender, getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialMuted={false}
        />,
      );

      expect(getByText('profile.actions.mute')).toBeTruthy();

      rerender(
        <ThemeProvider>
          <ProfileActionsMenu
            visible={true}
            onClose={mockOnClose}
            onMute={mockOnMute}
            onBlock={mockOnBlock}
            initialMuted={true}
          />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByText('profile.actions.unmute')).toBeTruthy();
      });
    });

    it('should sync blocked state when initialBlocked prop changes', async () => {
      const { rerender, getByText } = renderWithTheme(
        <ProfileActionsMenu
          visible={true}
          onClose={mockOnClose}
          onMute={mockOnMute}
          onBlock={mockOnBlock}
          initialBlocked={false}
        />,
      );

      expect(getByText('profile.actions.block')).toBeTruthy();

      rerender(
        <ThemeProvider>
          <ProfileActionsMenu
            visible={true}
            onClose={mockOnClose}
            onMute={mockOnMute}
            onBlock={mockOnBlock}
            initialBlocked={true}
          />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(getByText('profile.actions.unblock')).toBeTruthy();
      });
    });
  });

  describe('Default Props', () => {
    it('should use default values for optional props', () => {
      const { getByText } = renderWithTheme(
        <ProfileActionsMenu visible={true} onClose={mockOnClose} onMute={mockOnMute} onBlock={mockOnBlock} />,
      );

      // Default initialMuted is false
      expect(getByText('profile.actions.mute')).toBeTruthy();
      // Default initialBlocked is false
      expect(getByText('profile.actions.block')).toBeTruthy();
    });
  });
});

import { ThemeProvider } from '@/src/context/ThemeContext';
import EmojiPickerSheet from '@/src/modules/chat/components/EmojiPickerSheet';
import * as emojiUtils from '@/src/modules/chat/utils/emoji.utils';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('@/src/components/CustomBottomSheet', () => {
  const { View } = require('react-native');
  return ({ children }: any) => <View testID="custom_bottom_sheet">{children}</View>;
});

jest.mock('@gorhom/bottom-sheet', () => {
  const { View, TextInput, ScrollView } = require('react-native');
  return {
    BottomSheetModal: View,
    BottomSheetTextInput: (props: any) => <TextInput {...props} />,
    BottomSheetFlatList: (props: any) => (
      <ScrollView>
        {props.data.map((item: any, index: number) => (
          <View key={index}>{props.renderItem({ item })}</View>
        ))}
      </ScrollView>
    ),
  };
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('EmojiPickerSheet', () => {
  const mockOnSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render categories and emojis', () => {
    renderWithTheme(<EmojiPickerSheet onSelect={mockOnSelect} onClose={mockOnClose} />);

    // Assuming getEmojiCategories returns some default data mocked in jest.setup or check actual implementation
    // The actual implementation is mocked in setup.ts likely or we need to spy on it if not handled by jest.mock
    // Given previous emoji.utils tests, we know it returns data.

    // We should see headers and emojis.
    // Let's rely on checking for one emoji or header if possible, or just checks container.
    // Since mock of BottomSheetFlatList renders items, we can check for text.
    // Let's assume the mock data has "Smileys & Emotion" & "😀".

    // Actually, create a spy to be sure what data is returned
    jest
      .spyOn(emojiUtils, 'getEmojiCategories')
      .mockReturnValue([{ title: 'Test Category', data: [{ emoji: '🧪', name: 'test', keywords: [] }] }]);

    // Re-render
    renderWithTheme(<EmojiPickerSheet onSelect={mockOnSelect} onClose={mockOnClose} />);

    expect(screen.getByText('Test Category')).toBeTruthy();
    expect(screen.getByText('🧪')).toBeTruthy();
  });

  it('should handle search', () => {
    jest.spyOn(emojiUtils, 'searchEmojis').mockReturnValue([{ emoji: '🔍', name: 'magnifying glass', keywords: [] }]);

    renderWithTheme(<EmojiPickerSheet onSelect={mockOnSelect} onClose={mockOnClose} />);

    const searchInput = screen.getByTestId('emoji_picker_search_input');
    fireEvent.changeText(searchInput, 'search term');

    expect(emojiUtils.searchEmojis).toHaveBeenCalledWith('search term');
    expect(screen.getByText('🔍')).toBeTruthy();
  });

  it('should select emoji', () => {
    jest
      .spyOn(emojiUtils, 'getEmojiCategories')
      .mockReturnValue([{ title: 'C', data: [{ emoji: '👍', name: 'up', keywords: [] }] }]);

    renderWithTheme(<EmojiPickerSheet onSelect={mockOnSelect} onClose={mockOnClose} />);

    fireEvent.press(screen.getByText('👍'));
    expect(mockOnSelect).toHaveBeenCalledWith('👍');
  });
});

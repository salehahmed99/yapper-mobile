import { ThemeProvider } from '@/src/context/ThemeContext';
import ChatInput from '@/src/modules/chat/components/ChatInput';
import * as chatService from '@/src/modules/chat/services/chatService';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';

// Mocks
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('@/src/modules/chat/services/chatService', () => ({
  uploadMessageImage: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ChatInput', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input field', () => {
    renderWithTheme(<ChatInput value="" onChangeText={mockOnChangeText} onSend={mockOnSend} />);
    expect(screen.getByTestId('chat_input_text_field')).toBeTruthy();
  });

  it('should disable send button when empty', () => {
    renderWithTheme(<ChatInput value="" onChangeText={mockOnChangeText} onSend={mockOnSend} />);
    const sendBtn = screen.getByTestId('chat_input_send_button');
    fireEvent.press(sendBtn);
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should enable send button when has text', () => {
    renderWithTheme(<ChatInput value="Hello" onChangeText={mockOnChangeText} onSend={mockOnSend} />);
    const sendBtn = screen.getByTestId('chat_input_send_button');
    fireEvent.press(sendBtn);
    expect(mockOnSend).toHaveBeenCalled();
  });

  it('should handle image picking and uploading', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://img.jpg' }],
    });
    (chatService.uploadMessageImage as jest.Mock).mockResolvedValue({ imageUrl: 'http://remote/img.jpg' });

    renderWithTheme(<ChatInput value="" onChangeText={mockOnChangeText} onSend={mockOnSend} />);

    const imageBtn = screen.getByTestId('chat_input_image_button');
    fireEvent.press(imageBtn);

    await waitFor(() => {
      expect(chatService.uploadMessageImage).toHaveBeenCalledWith('file://img.jpg');
    });

    // Now send button should be enabled (image uploaded)
    const sendBtn = screen.getByTestId('chat_input_send_button');
    fireEvent.press(sendBtn);

    expect(mockOnSend).toHaveBeenCalledWith('http://remote/img.jpg', null, null);
  });

  it('should show reply banner', () => {
    const replyContext = {
      messageId: 'm1',
      senderName: 'User 1',
      content: 'Hello',
      hasImage: false,
    };
    const mockOnCancelReply = jest.fn();

    renderWithTheme(
      <ChatInput
        value=""
        onChangeText={mockOnChangeText}
        onSend={mockOnSend}
        replyingTo={replyContext}
        onCancelReply={mockOnCancelReply}
      />,
    );

    expect(screen.getByText('Replying to User 1')).toBeTruthy();

    // Test cancel reply
    const cancelBtn = screen.getByTestId('reply_preview_close_button');
    fireEvent.press(cancelBtn);
    expect(mockOnCancelReply).toHaveBeenCalled();
  });

  it('should trim text on send', () => {
    renderWithTheme(<ChatInput value="  Trim Me  " onChangeText={mockOnChangeText} onSend={mockOnSend} />);
    const sendBtn = screen.getByTestId('chat_input_send_button');
    fireEvent.press(sendBtn);
    expect(mockOnSend).toHaveBeenCalledWith(null, null, null);
  });

  it('should not send if only whitespace', () => {
    renderWithTheme(<ChatInput value="   " onChangeText={mockOnChangeText} onSend={mockOnSend} />);
    const sendBtn = screen.getByTestId('chat_input_send_button');
    fireEvent.press(sendBtn);
    expect(mockOnSend).not.toHaveBeenCalled();
  });
});

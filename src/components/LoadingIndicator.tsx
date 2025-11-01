import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface ILoadingIndicatorProps {
  color?: string;
  size?: 'small' | 'large';
}
const LoadingIndicator: React.FC<ILoadingIndicatorProps> = (props) => {
  const { theme } = useTheme();
  const { color = theme.colors.text.secondary, size = 'small' } = props;
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingIndicator;

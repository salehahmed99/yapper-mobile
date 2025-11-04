import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface XLogoProps {
  /** Explicit width in pixels. Ignored if `size` is provided. */
  width?: number;
  /** Explicit height in pixels. Ignored if `size` is provided. */
  height?: number;
  /** Convenient shorthand to set both width and height. */
  size?: number;
  /** Preferred color for the icon. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const XLogo: React.FC<XLogoProps> = ({ size, width = 120, height = 32, color = '#0F1419', style }) => {
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 640 640" style={style}>
      <Path
        d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z"
        fill={color}
      />
    </Svg>
  );
};

export default XLogo;

import { StyleProp, ViewStyle } from 'react-native';

export interface ISvgIconProps {
  /** Explicit width in pixels. Ignored if `size` is provided. */
  width?: number;
  /** Explicit height in pixels. Ignored if `size` is provided. */
  height?: number;
  /** Convenient shorthand to set both width and height. */
  size?: number;
  /** Preferred stroke color for the icon. */
  stroke?: string;
  /** Whether the icon should be filled. */
  filled?: boolean;
  /** Stroke width for the icon. */
  strokeWidth?: number;
  /** Additional style for the icon container. */
  style?: StyleProp<ViewStyle>;
}

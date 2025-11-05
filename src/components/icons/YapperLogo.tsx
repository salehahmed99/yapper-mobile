import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface YapperLogoProps {
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

const YapperLogo: React.FC<YapperLogoProps> = ({ size, width = 305, height = 306, color = '#FEFEFE', style }) => {
  const aspectRatio = 306 / 305;
  const w = size ?? width;
  const h = size ? size * aspectRatio : height;

  return (
    <Svg width={w} height={h} viewBox="0 0 305 306" style={style}>
      <Path
        fill={color}
        fillRule="evenodd"
        d="M242.6 57.5106L260.906 57.5016C257.993 60.3911 252.886 66.6756 250.004 70.0128L228.487 94.9438L161.724 172.334L105.549 237.233L88.1146 257.401C85.6103 260.298 81.1425 265.173 78.9895 268.152C72.8307 268.183 66.6718 268.16 60.5134 268.084C63.3733 265.154 66.6262 261.147 69.3673 257.966L84.5575 240.379C103.397 218.599 122.347 196.124 141.42 174.629C138.794 171.248 135.287 165.829 132.77 162.18L116.097 138.013L60.5215 57.5169L122.201 57.5084L175.628 134.955C183.671 125.155 193.221 114.615 201.577 104.942L242.6 57.5106Z
           M85.6504 71.0851C87.4608 71.3471 92.9016 71.2158 94.8828 71.2127C101.096 71.1822 107.309 71.1914 113.522 71.2403C123.222 85.7617 134.486 101.165 144.583 115.543L158.088 134.799C160.605 138.391 163.628 142.919 166.285 146.274C163.516 149.398 160.78 152.551 158.079 155.735C156.045 158.072 152.326 162.131 150.651 164.5C149.756 162.655 146.427 158.13 145.109 156.26L134.971 141.834L97.2738 88.0882C95.606 85.7281 86.2544 72.9674 85.6504 71.0851Z"
      />
    </Svg>
  );
};

export default YapperLogo;

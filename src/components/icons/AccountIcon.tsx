import { ISvgIconProps } from '@/src/types/svg';
import Svg, { Path } from 'react-native-svg';

const AccountIcon: React.FC<ISvgIconProps> = (props) => {
  const { size, width, height, stroke, strokeWidth, style } = props;
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" style={style}>
      <Path
        d={
          'M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z'
        }
        fill={stroke}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default AccountIcon;

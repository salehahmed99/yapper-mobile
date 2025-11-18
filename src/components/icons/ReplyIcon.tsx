import { ISvgIconProps } from '@/src/types/svg';
import Svg, { Path } from 'react-native-svg';

const ReplyIcon: React.FC<ISvgIconProps> = (props) => {
  const { size, width, height, stroke, fill, strokeWidth, style } = props;
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 88 82" style={style}>
      <Path
        d="M3.66586 32.9928C3.66586 54.988 27.494 61.0978 39.4081 61.4033V76.0667C71.4844 61.4033 84.0095 43.0739 83.3985 32.9928C83.3985 5.86537 55.9045 3.66586 42.1575 3.66586C29.3269 3.66586 3.66586 10.9976 3.66586 32.9928Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </Svg>
  );
};

export default ReplyIcon;

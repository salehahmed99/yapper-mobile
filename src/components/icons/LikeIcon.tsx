import { ISvgIconProps } from '@/src/types/svg';
import Svg, { Path } from 'react-native-svg';

const LikeIcon: React.FC<ISvgIconProps> = (props) => {
  const { size, width, height, stroke, fill, strokeWidth, style } = props;
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 89 76" style={style}>
      <Path
        d="M6.17377 14.1115C19.9211 -7.53421 38.1886 11.3622 43.7489 18.6939C51.0192 8.61282 70.1463 -7.41574 82.2406 15.0281C94.0931 37.0232 60.5508 62.0733 43.7489 70.9325C22.9757 59.9349 -4.88525 31.5244 6.17377 14.1115Z"
        fill={fill}
        strokeWidth={strokeWidth}
        stroke={stroke}
      />
    </Svg>
  );
};

export default LikeIcon;

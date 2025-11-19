import { ISvgIconProps } from '@/src/types/svg';
import Svg, { Path } from 'react-native-svg';

const ViewsIcon: React.FC<ISvgIconProps> = (props) => {
  const { size, width, height, stroke, strokeWidth, style } = props;
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" style={style}>
      <Path
        d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"
        fill={stroke}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};

export default ViewsIcon;

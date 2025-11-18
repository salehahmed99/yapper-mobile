import { ISvgIconProps } from '@/src/types/svg';
import Svg, { Path } from 'react-native-svg';

const ShareIcon: React.FC<ISvgIconProps> = (props) => {
  const { size, width, height, stroke, style } = props;
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 18 19" style={style}>
      <Path
        d="M9 0L14.7 5.7L13.29 7.12L10 3.82V13.41H8V3.82L4.7 7.12L3.29 5.7L9 0ZM18 12.41L17.98 15.92C17.98 17.3 16.86 18.41 15.48 18.41H2.5C1.11 18.41 0 17.29 0 15.91V12.41H2V15.91C2 16.19 2.22 16.41 2.5 16.41H15.48C15.76 16.41 15.98 16.19 15.98 15.91L16 12.41H18Z"
        fill={stroke}
      />
    </Svg>
  );
};

export default ShareIcon;

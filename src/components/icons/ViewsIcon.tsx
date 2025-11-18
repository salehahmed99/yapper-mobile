import { ISvgIconProps } from '@/src/types/svg';
import Svg, { Path } from 'react-native-svg';

const ViewsIcon: React.FC<ISvgIconProps> = (props) => {
  const { size, width, height, stroke, style } = props;
  const w = size ?? width;
  const h = size ?? height;

  return (
    <Svg width={w} height={h} viewBox="0 0 14 15" style={style}>
      <Path
        d="M3.90108 14.7831V0H5.54365V14.7831H3.90108ZM11.4979 14.7831V4.51705H13.1405V14.7831H11.4979ZM0 14.7831L0.00328528 6.57025H1.64585L1.64256 14.7831H0ZM7.59521 14.7831V9.03409H9.23777V14.7831H7.59521Z"
        fill={stroke}
      />
    </Svg>
  );
};

export default ViewsIcon;

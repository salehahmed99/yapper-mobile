import { View } from 'react-native';
import { SettingsItem as SettingsItemComponent } from './SettingsItem';
import { ISettingsItem as SettingsItemType } from '../types/types';

interface ISettingsSectionProps {
  items: SettingsItemType[];
  onItemPress?: (item: SettingsItemType) => void;
  showChevron?: boolean;
  showDescription?: boolean;
  showIcons?: boolean;
}

export const SettingsSection: React.FC<ISettingsSectionProps> = ({
  items,
  onItemPress,
  showChevron,
  showDescription,
  showIcons,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View>
      {items.map((item) => (
        <SettingsItemComponent
          key={item.id}
          item={item}
          onPress={onItemPress}
          showChevron={showChevron}
          showDescription={showDescription}
          showIcons={showIcons}
        />
      ))}
    </View>
  );
};

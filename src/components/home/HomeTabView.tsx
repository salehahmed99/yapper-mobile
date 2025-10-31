import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomTabView from '../CustomTabView';

interface HomeTabViewProps {
  scrollable?: boolean;
  index?: number;
  onIndexChange?: (index: number) => void;
}

const HomeTabView: React.FC<HomeTabViewProps> = ({ scrollable = false, index, onIndexChange }) => {
  const { t } = useTranslation();

  const routes = React.useMemo(
    () => [
      { key: 'foryou', title: t('home.tabs.forYou') },
      { key: 'following', title: t('home.tabs.following') },
    ],
    [t],
  );

  return <CustomTabView routes={routes} scrollable={scrollable} index={index} onIndexChange={onIndexChange} />;
};

export default HomeTabView;

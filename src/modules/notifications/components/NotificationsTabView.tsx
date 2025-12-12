import CustomTabView from '@/src/components/CustomTabView';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationsTabViewProps {
  scrollable?: boolean;
  index?: number;
  onIndexChange?: (index: number) => void;
}

const NotificationsTabView: React.FC<NotificationsTabViewProps> = ({ scrollable = false, index, onIndexChange }) => {
  const { t } = useTranslation();

  const routes = React.useMemo(
    () => [
      { key: 'all', title: t('notifications.tabs.all') },
      { key: 'mentions', title: t('notifications.tabs.mentions') },
    ],
    [t],
  );

  return <CustomTabView routes={routes} scrollable={scrollable} index={index} onIndexChange={onIndexChange} />;
};

export default NotificationsTabView;

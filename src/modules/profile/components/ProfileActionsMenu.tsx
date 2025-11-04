import { Ban, Volume2, VolumeOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownMenu, { DropdownMenuItem } from '../../../components/DropdownMenu';
import { useTheme } from '../../../context/ThemeContext';

interface IProfileActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onMute: () => void | Promise<void>;
  onBlock: () => void | Promise<void>;
  initialMuted?: boolean;
  initialBlocked?: boolean;
  blockLoading?: boolean;
}

const ProfileActionsMenu: React.FC<IProfileActionsMenuProps> = ({
  visible,
  onClose,
  onMute,
  onBlock,
  initialMuted = false,
  initialBlocked = false,
  blockLoading = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isBlocked, setIsBlocked] = useState(initialBlocked);
  const [isMuteLoading, setIsMuteLoading] = useState(false);

  // Sync state when initialMuted or initialBlocked changes
  useEffect(() => {
    setIsMuted(initialMuted);
  }, [initialMuted]);

  useEffect(() => {
    setIsBlocked(initialBlocked);
  }, [initialBlocked]);

  const handleMuteToggle = async () => {
    if (isMuteLoading) return;

    setIsMuteLoading(true);
    try {
      await onMute();
      setIsMuted(!isMuted);
    } catch (error) {
      // Error is handled in parent component
      console.error('Error toggling mute:', error);
    } finally {
      setIsMuteLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (blockLoading) return;

    try {
      await onBlock();
      setIsBlocked(!isBlocked);
    } catch (error) {
      // Error is handled in parent component
      console.error('Error toggling block:', error);
    }
  };

  const menuItems: DropdownMenuItem[] = [
    {
      label: isMuted ? t('profile.actions.unmute') : t('profile.actions.mute'),
      onPress: handleMuteToggle,
      icon: isMuted ? (
        <Volume2 color={theme.colors.text.primary} size={20} strokeWidth={1.5} />
      ) : (
        <VolumeOff color={theme.colors.text.primary} size={20} strokeWidth={1.5} />
      ),
      disabled: isMuteLoading,
    },
    {
      label: isBlocked ? t('profile.actions.unblock') : t('profile.actions.block'),
      onPress: handleBlockToggle,
      icon: <Ban color={theme.colors.text.primary} size={20} strokeWidth={1.5} />,
      disabled: blockLoading,
    },
  ];

  return <DropdownMenu visible={visible} onClose={onClose} items={menuItems} position={{ top: 100, right: 16 }} />;
};

export default ProfileActionsMenu;

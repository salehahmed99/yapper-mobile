import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { createEditModalStyles } from '../styles/edit-modal-styles';
import Input from '../ui/Input';
import { DEFAULT_AVATAR_URI, DEFAULT_BANNER_URI, showImagePickerOptions } from '../utils/edit-profile.utils';
import { formatLongDateToDisplay } from '../utils/helper-functions.utils';

type IEditProfileModalProps = {
  visible: boolean;
  imageUri: string;
  bannerUri: string;
  onImageChange: (newUri: string) => void;
  onBannerChange: (newUri: string) => void;
  onClose: () => void;
};

const EditProfileModal: React.FC<IEditProfileModalProps> = ({
  visible,
  onClose,
  imageUri,
  bannerUri,
  onImageChange,
  onBannerChange,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const [updatedUser, setUpdatedUser] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.country || '',
    website: '',
    birthday: user?.birthDate || '',
  });

  const { theme } = useTheme();
  const editModalStyles = useMemo(() => createEditModalStyles(theme), [theme]);

  const handleAvatarChange = () => {
    showImagePickerOptions(
      true, // isAvatar
      onImageChange,
      () => onImageChange(DEFAULT_AVATAR_URI),
    );
  };

  const handleBannerChange = () => {
    showImagePickerOptions(
      false, // isBanner
      onBannerChange,
      () => onBannerChange(DEFAULT_BANNER_URI),
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {/* Header buttons */}
      <View style={editModalStyles.buttonContainer}>
        <TouchableOpacity onPress={onClose}>
          <Text style={editModalStyles.buttonsText}>{t('profile.editModal.cancel')}</Text>
        </TouchableOpacity>

        <Text style={editModalStyles.titleText}>{t('profile.editModal.title')}</Text>

        <TouchableOpacity onPress={onClose}>
          <Text style={editModalStyles.buttonsText}>{t('profile.editModal.save')}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal content */}
      <View style={editModalStyles.contentContainer}>
        {/* Banner */}
        <TouchableOpacity onPress={handleBannerChange}>
          <Image source={{ uri: bannerUri }} style={editModalStyles.banner} />
        </TouchableOpacity>

        <View style={editModalStyles.insideContainer}>
          {/* Profile Image Edit */}
          <View style={editModalStyles.avatarContainer}>
            <TouchableOpacity onPress={handleAvatarChange}>
              <Image
                source={{
                  uri: imageUri,
                }}
                style={editModalStyles.avatar}
              />

              {/* Dark overlay + camera icon */}
              <View style={editModalStyles.overlay}>
                <Ionicons name="camera-outline" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* User Details */}
          <View style={editModalStyles.userDetailsContainer}>
            {/* Name Input */}
            <Input
              label={t('profile.editModal.name')}
              value={updatedUser.name}
              setValue={(value) => setUpdatedUser({ ...updatedUser, name: value })}
              style={editModalStyles.inputContainer}
              inputStyle={editModalStyles.input}
              placeholder={t('profile.editModal.namePlaceholder')}
            />

            {/* Bio Input */}
            <Input
              label={t('profile.editModal.bio')}
              value={updatedUser.bio}
              setValue={(value) => setUpdatedUser({ ...updatedUser, bio: value })}
              style={editModalStyles.inputContainer}
              inputStyle={editModalStyles.inputMultiline}
              placeholder={t('profile.editModal.bioPlaceholder')}
              multiline
              numberOfLines={4}
            />

            {/* Location Input */}
            <Input
              label={t('profile.editModal.location')}
              value={updatedUser.location}
              setValue={(value) => setUpdatedUser({ ...updatedUser, location: value })}
              style={editModalStyles.inputContainer}
              inputStyle={editModalStyles.input}
              placeholder={t('profile.editModal.locationPlaceholder')}
            />

            {/* Website Input */}
            <Input
              label={t('profile.editModal.website')}
              value={updatedUser.website}
              setValue={(value) => setUpdatedUser({ ...updatedUser, website: value })}
              style={editModalStyles.inputContainer}
              inputStyle={editModalStyles.input}
              placeholder={t('profile.editModal.websitePlaceholder')}
            />

            {/* Birthday Input */}
            <Input
              label={t('profile.editModal.birthday')}
              value={updatedUser.birthday ? formatLongDateToDisplay(updatedUser.birthday) : ''}
              setValue={(value) => setUpdatedUser({ ...updatedUser, birthday: value })}
              style={editModalStyles.inputContainer}
              inputStyle={editModalStyles.input}
              placeholder={t('profile.editModal.birthdayPlaceholder')}
            />
          </View>
        </View>
      </View>

      <StatusBar style="light" />
    </Modal>
  );
};

export default memo(EditProfileModal);

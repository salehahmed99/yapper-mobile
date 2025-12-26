import CountryPicker, { Country } from '@/src/components/CountryPicker';
import { DEFAULT_AVATAR_URL, DEFAULT_BANNER_URL } from '@/src/constants/defaults';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../../../context/ThemeContext';
import { updateUserProfile, uploadAvatar, uploadCover } from '../services/profileService';
import { createEditModalStyles } from '../styles/edit-modal-styles';
import Input from '../ui/Input';
import { showImagePickerOptions } from '../utils/edit-profile.utils';
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
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);

  const [updatedUser, setUpdatedUser] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    country: user?.country || '',
    website: '',
    birthday: user?.birthDate || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [newCoverUri, setNewCoverUri] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);

  const [localAvatarUri, setLocalAvatarUri] = useState(imageUri);
  const [localBannerUri, setLocalBannerUri] = useState(bannerUri);

  const { theme } = useTheme();
  const editModalStyles = useMemo(() => createEditModalStyles(theme), [theme]);

  React.useEffect(() => {
    if (visible) {
      setLocalAvatarUri(imageUri);
      setLocalBannerUri(bannerUri);
    }
  }, [visible, imageUri, bannerUri]);

  const handleAvatarChange = () => {
    const isDefaultAvatar = localAvatarUri === DEFAULT_AVATAR_URL;
    showImagePickerOptions(
      true,
      (uri) => {
        setLocalAvatarUri(uri);
        setNewAvatarUri(uri);
      },
      async () => {
        setLocalAvatarUri(DEFAULT_AVATAR_URL);
        setNewAvatarUri(DEFAULT_AVATAR_URL);
      },
      !isDefaultAvatar,
    );
  };

  const handleBannerChange = () => {
    const isDefaultBanner = localBannerUri === DEFAULT_BANNER_URL;
    showImagePickerOptions(
      false,
      (uri) => {
        setLocalBannerUri(uri);
        setNewCoverUri(uri);
      },
      async () => {
        setLocalBannerUri(DEFAULT_BANNER_URL);
        setNewCoverUri(DEFAULT_BANNER_URL);
      },
      !isDefaultBanner,
    );
  };

  const handleDateConfirm = (date: Date) => {
    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    // Validate minimum age of 13
    if (age < 13) {
      Alert.alert(t('profile.editModal.ageError'), t('profile.editModal.ageErrorMessage'), [{ text: t('common.ok') }]);
      setDatePickerVisible(false);
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    setUpdatedUser({ ...updatedUser, birthday: formattedDate });
    setDatePickerVisible(false);
  };

  const handleDateCancel = () => {
    setDatePickerVisible(false);
  };

  const handleCountrySelect = (country: Country) => {
    setUpdatedUser({ ...updatedUser, country: country.name });
    setCountryPickerVisible(false);
  };

  const handleSave = async () => {
    if (!updatedUser.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      let avatarUrl: string | undefined | null;
      let coverUrl: string | undefined | null;

      if (newAvatarUri) {
        if (newAvatarUri === DEFAULT_AVATAR_URL) {
          if (user?.avatarUrl && user.avatarUrl !== DEFAULT_AVATAR_URL) {
            // await deleteAvatar(user.avatarUrl);
          }
          avatarUrl = null;
        } else if (newAvatarUri.startsWith('file://') || newAvatarUri.startsWith('content://')) {
          const uploadResponse = await uploadAvatar(newAvatarUri);
          avatarUrl = uploadResponse.imageUrl;
        }
      }

      if (newCoverUri) {
        if (newCoverUri === DEFAULT_BANNER_URL) {
          if (user?.coverUrl && user.coverUrl !== DEFAULT_BANNER_URL) {
            // await deleteCover(user.coverUrl);
          }
          coverUrl = null;
        } else if (newCoverUri.startsWith('file://') || newCoverUri.startsWith('content://')) {
          const uploadResponse = await uploadCover(newCoverUri);
          coverUrl = uploadResponse.imageUrl;
        }
      }

      const profileData: {
        name: string;
        bio: string;
        country: string;
        birthDate?: string;
        avatar_url?: string | null;
        cover_url?: string | null;
      } = {
        name: updatedUser.name,
        bio: updatedUser.bio,
        country: updatedUser.country,
        ...(updatedUser.birthday && { birthDate: updatedUser.birthday }),
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
        ...(coverUrl !== undefined && { cover_url: coverUrl }),
      };

      await updateUserProfile(profileData);
      await fetchAndUpdateUser();

      onImageChange(localAvatarUri);
      onBannerChange(localBannerUri);

      setNewAvatarUri(null);
      setNewCoverUri(null);

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID="profile_edit_modal"
    >
      {/* Header buttons */}
      <View style={editModalStyles.buttonContainer} testID="profile_edit_modal_header">
        <TouchableOpacity
          onPress={() => {
            if (user) {
              setUpdatedUser({
                name: user.name || '',
                bio: user.bio || '',
                country: user.country || '',
                website: '',
                birthday: user.birthDate || '',
              });
              setLocalAvatarUri(imageUri);
              setLocalBannerUri(bannerUri);
            }
            onClose();
          }}
          disabled={isSaving}
          testID="profile_edit_modal_cancel_button"
        >
          <Text style={editModalStyles.buttonsText}>{t('profile.editModal.cancel')}</Text>
        </TouchableOpacity>

        <Text style={editModalStyles.titleText} testID="profile_edit_modal_title">
          {t('profile.editModal.title')}
        </Text>

        <TouchableOpacity onPress={handleSave} disabled={isSaving} testID="profile_edit_modal_save_button">
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.text.link} />
          ) : (
            <Text style={editModalStyles.buttonsText}>{t('profile.editModal.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal content */}
      <View style={editModalStyles.contentContainer} testID="profile_edit_modal_content">
        {/* Banner */}
        <TouchableOpacity onPress={handleBannerChange} testID="profile_edit_modal_banner_button">
          <Image
            key={localBannerUri}
            source={{ uri: localBannerUri }}
            style={editModalStyles.banner}
            testID="profile_edit_modal_banner_image"
            cachePolicy="memory-disk"
            priority="high"
          />
        </TouchableOpacity>

        <View style={editModalStyles.insideContainer}>
          {/* Profile Image Edit */}
          <View style={editModalStyles.avatarContainer}>
            <TouchableOpacity onPress={handleAvatarChange} testID="profile_edit_modal_avatar_button">
              <Image
                key={localAvatarUri}
                source={{
                  uri: localAvatarUri,
                }}
                style={editModalStyles.avatar}
                testID="profile_edit_modal_avatar_image"
                cachePolicy="memory-disk"
                priority="high"
              />

              {/* Dark overlay + camera icon */}
              <View style={editModalStyles.overlay}>
                <Ionicons name="camera-outline" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* User Details */}
          <View style={editModalStyles.userDetailsContainer} testID="profile_edit_modal_form_container">
            {/* Name Input */}
            <Input
              testID="profile_edit_modal_name_input"
              label={t('profile.editModal.name')}
              value={updatedUser.name}
              setValue={(value) => setUpdatedUser({ ...updatedUser, name: value })}
              style={editModalStyles.inputContainer}
              inputStyle={editModalStyles.input}
              placeholder={t('profile.editModal.namePlaceholder')}
            />

            {/* Bio Input */}
            <Input
              testID="profile_edit_modal_bio_input"
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
            <View style={editModalStyles.inputContainer}>
              <Text style={editModalStyles.label}>{t('profile.editModal.country')}</Text>
              <TouchableOpacity testID="profile_edit_modal_country_input" onPress={() => setCountryPickerVisible(true)}>
                <Text
                  style={{
                    color: updatedUser.country ? theme.colors.text.link : theme.colors.text.secondary,
                    fontWeight: theme.typography.weights.semiBold,
                    fontSize: theme.typography.sizes.sm,
                  }}
                >
                  {updatedUser.country || t('profile.editModal.countryPlaceholder')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Birthday Input */}
            <View style={editModalStyles.inputContainer}>
              <Text style={editModalStyles.label}>{t('profile.editModal.birthday')}</Text>
              <TouchableOpacity testID="profile_edit_modal_birthday_input" onPress={() => setDatePickerVisible(true)}>
                <Text
                  style={{
                    color: updatedUser.birthday ? theme.colors.text.link : theme.colors.text.secondary,
                    fontWeight: theme.typography.weights.semiBold,
                    fontSize: theme.typography.sizes.sm,
                  }}
                >
                  {updatedUser.birthday
                    ? formatLongDateToDisplay(updatedUser.birthday)
                    : t('profile.editModal.birthdayPlaceholder')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
        date={updatedUser.birthday ? new Date(updatedUser.birthday) : new Date()}
        maximumDate={new Date()}
      />

      <Modal
        visible={isCountryPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <CountryPicker
          onSelect={handleCountrySelect}
          onBack={() => setCountryPickerVisible(false)}
          showBackButton={true}
          initialCountry={updatedUser.country ? { name: updatedUser.country } : null}
        />
      </Modal>

      <StatusBar style="light" />
    </Modal>
  );
};

export default memo(EditProfileModal);

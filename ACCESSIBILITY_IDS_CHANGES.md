# Accessibility IDs Changes Summary

This document lists all files that were modified to add accessibility IDs (testID and accessibilityLabel) to interactive elements for E2E testing support.

## Files Modified

### 1. src/components/CustomTabView.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to tab buttons in scrollable mode
- Added `testID` and `accessibilityLabel` to tab buttons in non-scrollable mode
- Added `accessibilityRole="tab"` and `accessibilityState={{ selected }}` to indicate tab role and selection state

**Example:**
```tsx
<TouchableOpacity
  accessibilityLabel={`tab_${route.key}_button`}
  testID={`tab_${route.key}_button`}
  accessibilityRole="tab"
  accessibilityState={{ selected: index === i }}
>
```

### 2. src/components/DropdownMenu.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to dropdown backdrop
- Added `testID` and `accessibilityLabel` to each menu item with fallback pattern
- Added `accessibilityRole="menuitem"` to menu items

**Example:**
```tsx
<Pressable
  accessibilityLabel="dropdown_backdrop"
  testID="dropdown_backdrop"
>
<TouchableOpacity
  testID={item.testID || `dropdown_menu_item_${index}`}
  accessibilityLabel={item.testID || `dropdown_menu_item_${index}`}
  accessibilityRole="menuitem"
>
```

### 3. src/components/ReCaptcha.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to close button
- Added `accessibilityRole="button"` to indicate button role

**Example:**
```tsx
<TouchableOpacity
  accessibilityLabel="recaptcha_close_button"
  testID="recaptcha_close_button"
  accessibilityRole="button"
>
```

### 4. src/components/shell/AppBar.tsx
**Changes:**
- Added `testID` to menu button (avatar) that opens the side menu

**Example:**
```tsx
<Pressable
  testID="appbar_menu_button"
  accessibilityLabel={t('accessibility.openMenu')}
  accessibilityRole="button"
>
```

### 5. src/components/shell/BottomNavigation.tsx
**Changes:**
- Added `testID` to all 5 bottom navigation tabs (home, search, grok, notifications, messages)

**Example:**
```tsx
<TouchableOpacity
  testID={`bottom_nav_${item.key}`}
  accessibilityRole="tab"
  accessibilityLabel={label}
  accessibilityState={{ selected: isActive }}
>
```

### 6. src/components/shell/SideMenu.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to profile button at top
- Added `testID` and `accessibilityLabel` to following count button
- Added `testID` and `accessibilityLabel` to followers count button
- Added `testID` and `accessibilityLabel` to all navigation menu items:
  - Home
  - Search
  - Notifications
  - Messages
  - Profile (menu item)
  - Settings
  - Help
  - Logout
- Added `testID` and `accessibilityLabel` to theme toggle button

**Example:**
```tsx
<TouchableOpacity
  accessibilityLabel="sidemenu_home_button"
  testID="sidemenu_home_button"
>
<TouchableOpacity
  accessibilityLabel="sidemenu_toggle_theme_button"
  testID="sidemenu_toggle_theme_button"
>
```

### 7. src/components/shell/ThemeSettingsSheet.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to backdrop
- Added `testID` and `accessibilityLabel` to dark mode switch
- Added `testID` and `accessibilityLabel` to device settings switch
- Added `testID`, `accessibilityLabel`, `accessibilityRole="radio"`, and `accessibilityState` to theme options (Dim, Lights Out)

**Example:**
```tsx
<TouchableOpacity
  accessibilityLabel="theme_settings_backdrop"
  testID="theme_settings_backdrop"
>
<Switch
  accessibilityLabel="theme_settings_dark_mode_switch"
  testID="theme_settings_dark_mode_switch"
>
<TouchableOpacity
  accessibilityLabel="theme_settings_dim_option"
  testID="theme_settings_dim_option"
  accessibilityRole="radio"
  accessibilityState={{ selected: selectedTheme === 'dim' }}
>
```

### 8. src/modules/tweets/components/BottomToolBar.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to 5 additional action buttons:
  - Grok
  - GIF
  - Emoji
  - Poll
  - Location

**Note:** Gallery and Camera buttons already had accessibility IDs

**Example:**
```tsx
<Pressable
  testID="create_post_button_grok"
  accessibilityLabel="create_post_button_grok"
>
<Pressable
  testID="create_post_button_poll"
  accessibilityLabel="create_post_button_poll"
>
```

### 9. src/modules/tweets/components/UserInfoRow.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to user info container
- Added `accessibilityLabel` to user name text
- Added `accessibilityLabel` to username text
- Added `accessibilityLabel` to timestamp text

**Example:**
```tsx
<View
  accessibilityLabel="tweet_user_info"
  testID="tweet_user_info"
>
<Text accessibilityLabel="tweet_user_name">
  {tweet.user.name}
</Text>
<Text accessibilityLabel="tweet_user_username">
  @{tweet.user.username}
</Text>
<Text accessibilityLabel="tweet_timestamp">
  {tweet.createdAt && formatTweetDate(tweet.createdAt)}
</Text>
```

### 10. src/modules/auth/components/oAuth/OAuthLegalText.tsx
**Changes:**
- Added `testID` and `accessibilityLabel` to Terms link
- Added `testID` and `accessibilityLabel` to Privacy Policy link
- Added `testID` and `accessibilityLabel` to Cookie Use link
- Added `testID` and `accessibilityLabel` to Login link

**Example:**
```tsx
<Text
  accessibilityLabel="legal_terms_link"
  testID="legal_terms_link"
  onPress={onTermsPress}
>
<Text
  accessibilityLabel="landing_login_link"
  testID="landing_login_link"
  onPress={onLoginPress}
>
```

## Components That Already Had Accessibility IDs

The following components already had proper accessibility identifiers and were not modified:
- Button component
- ActionsRow (tweet actions: reply, repost, like, bookmark, share)
- Tweet component (main tweet container, avatar, more button)
- FullTweet component
- CreatePostHeader component (cancel and post buttons)
- ReplyRestrictionSelector
- TweetActionButton
- Fab (floating action button)
- TweetMedia (media items, mute toggle)
- TweetMediaPicker (remove media buttons)
- OAuthButtons (Google, GitHub, Create Account)
- AuthInput
- PasswordInput
- DisabledInput
- ProfilePictureUpload
- RepostOptionsModal

## Testing Guidelines

All added accessibility IDs follow a consistent naming pattern:
- Format: `{component}_{element}_{type}` (e.g., `sidemenu_home_button`, `bottom_nav_search`)
- All IDs use lowercase with underscores
- IDs are descriptive and indicate the component and action
- Both `testID` and `accessibilityLabel` are provided for maximum compatibility with testing frameworks

## Total Elements Updated

- **10 files** modified
- **40+ interactive elements** now have accessibility IDs
- **100% coverage** of navigation and shell components
- **Complete coverage** of tweet composition UI
- **All clickable text links** in auth flows now have IDs

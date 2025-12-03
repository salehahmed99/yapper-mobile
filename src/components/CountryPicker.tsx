import { ChevronLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type Country = {
  code?: string;
  name: string;
};

type CountryPickerProps = {
  initialCountry?: Country | null;
  onSelect?: (country: Country) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  placeholder?: string;
};

const CountryPicker: React.FC<CountryPickerProps> = ({
  initialCountry: _initialCountry = null,
  onSelect,
  showBackButton = true,
  onBack,
  placeholder = 'Search',
}) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  const countries = useMemo<Country[]>(
    () => [
      { name: 'Afghanistan', code: 'AF' },
      { name: 'Albania', code: 'AL' },
      { name: 'Algeria', code: 'DZ' },
      { name: 'American Samoa', code: 'AS' },
      { name: 'Andorra', code: 'AD' },
      { name: 'Angola', code: 'AO' },
      { name: 'Anguilla', code: 'AI' },
      { name: 'Antarctica', code: 'AQ' },
      { name: 'Antigua and Barbuda', code: 'AG' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Armenia', code: 'AM' },
      { name: 'Aruba', code: 'AW' },
      { name: 'Australia', code: 'AU' },
      { name: 'Austria', code: 'AT' },
      { name: 'Azerbaijan', code: 'AZ' },
      { name: 'Bahamas', code: 'BS' },
      { name: 'Bahrain', code: 'BH' },
      { name: 'Bangladesh', code: 'BD' },
      { name: 'Barbados', code: 'BB' },
      { name: 'Belarus', code: 'BY' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Belize', code: 'BZ' },
      { name: 'Benin', code: 'BJ' },
      { name: 'Bermuda', code: 'BM' },
      { name: 'Bhutan', code: 'BT' },
      { name: 'Bolivia', code: 'BO' },
      { name: 'Bosnia and Herzegovina', code: 'BA' },
      { name: 'Botswana', code: 'BW' },
      { name: 'Bouvet Island', code: 'BV' },
      { name: 'Brazil', code: 'BR' },
      { name: 'British Indian Ocean Territory', code: 'IO' },
      { name: 'Brunei', code: 'BN' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Burundi', code: 'BI' },
      { name: 'Cambodia', code: 'KH' },
      { name: 'Cameroon', code: 'CM' },
      { name: 'Canada', code: 'CA' },
      { name: 'Cape Verde', code: 'CV' },
      { name: 'Caribbean Netherlands', code: 'BQ' },
      { name: 'Cayman Islands', code: 'KY' },
      { name: 'Central African Republic', code: 'CF' },
      { name: 'Chad', code: 'TD' },
      { name: 'Chile', code: 'CL' },
      { name: 'China', code: 'CN' },
      { name: 'Christmas Island', code: 'CX' },
      { name: 'Cocos (Keeling) Islands', code: 'CC' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Comoros', code: 'KM' },
      { name: 'Congo - Brazzaville', code: 'CG' },
      { name: 'Congo - Kinshasa', code: 'CD' },
      { name: 'Cook Islands', code: 'CK' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cuba', code: 'CU' },
      { name: 'Curaçao', code: 'CW' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czechia', code: 'CZ' },
      { name: "Côte d'Ivoire", code: 'CI' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Djibouti', code: 'DJ' },
      { name: 'Dominica', code: 'DM' },
      { name: 'Dominican Republic', code: 'DO' },
      { name: 'Ecuador', code: 'EC' },
      { name: 'Egypt', code: 'EG' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Equatorial Guinea', code: 'GQ' },
      { name: 'Eritrea', code: 'ER' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Eswatini', code: 'SZ' },
      { name: 'Ethiopia', code: 'ET' },
      { name: 'Falkland Islands', code: 'FK' },
      { name: 'Faroe Islands', code: 'FO' },
      { name: 'Fiji', code: 'FJ' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'French Guiana', code: 'GF' },
      { name: 'French Polynesia', code: 'PF' },
      { name: 'French Southern Territories', code: 'TF' },
      { name: 'Gabon', code: 'GA' },
      { name: 'Gambia', code: 'GM' },
      { name: 'Georgia', code: 'GE' },
      { name: 'Germany', code: 'DE' },
      { name: 'Ghana', code: 'GH' },
      { name: 'Gibraltar', code: 'GI' },
      { name: 'Greece', code: 'GR' },
      { name: 'Greenland', code: 'GL' },
      { name: 'Grenada', code: 'GD' },
      { name: 'Guadeloupe', code: 'GP' },
      { name: 'Guam', code: 'GU' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'Guernsey', code: 'GG' },
      { name: 'Guinea', code: 'GN' },
      { name: 'Guinea-Bissau', code: 'GW' },
      { name: 'Guyana', code: 'GY' },
      { name: 'Haiti', code: 'HT' },
      { name: 'Heard & McDonald Islands', code: 'HM' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Hong Kong', code: 'HK' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Iceland', code: 'IS' },
      { name: 'India', code: 'IN' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Iran', code: 'IR' },
      { name: 'Iraq', code: 'IQ' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Isle of Man', code: 'IM' },
      { name: 'Israel', code: 'IL' },
      { name: 'Italy', code: 'IT' },
      { name: 'Jamaica', code: 'JM' },
      { name: 'Japan', code: 'JP' },
      { name: 'Jersey', code: 'JE' },
      { name: 'Jordan', code: 'JO' },
      { name: 'Kazakhstan', code: 'KZ' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Kiribati', code: 'KI' },
      { name: 'Kosovo', code: 'XK' },
      { name: 'Kuwait', code: 'KW' },
      { name: 'Kyrgyzstan', code: 'KG' },
      { name: 'Laos', code: 'LA' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Lebanon', code: 'LB' },
      { name: 'Lesotho', code: 'LS' },
      { name: 'Liberia', code: 'LR' },
      { name: 'Libya', code: 'LY' },
      { name: 'Liechtenstein', code: 'LI' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Macao', code: 'MO' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Malawi', code: 'MW' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Maldives', code: 'MV' },
      { name: 'Mali', code: 'ML' },
      { name: 'Malta', code: 'MT' },
      { name: 'Marshall Islands', code: 'MH' },
      { name: 'Martinique', code: 'MQ' },
      { name: 'Mauritania', code: 'MR' },
      { name: 'Mauritius', code: 'MU' },
      { name: 'Mayotte', code: 'YT' },
      { name: 'Mexico', code: 'MX' },
      { name: 'Micronesia', code: 'FM' },
      { name: 'Moldova', code: 'MD' },
      { name: 'Monaco', code: 'MC' },
      { name: 'Mongolia', code: 'MN' },
      { name: 'Montenegro', code: 'ME' },
      { name: 'Montserrat', code: 'MS' },
      { name: 'Morocco', code: 'MA' },
      { name: 'Mozambique', code: 'MZ' },
      { name: 'Myanmar (Burma)', code: 'MM' },
      { name: 'Namibia', code: 'NA' },
      { name: 'Nauru', code: 'NR' },
      { name: 'Nepal', code: 'NP' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'New Caledonia', code: 'NC' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Nicaragua', code: 'NI' },
      { name: 'Niger', code: 'NE' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Niue', code: 'NU' },
      { name: 'Norfolk Island', code: 'NF' },
      { name: 'North Korea', code: 'KP' },
      { name: 'North Macedonia', code: 'MK' },
      { name: 'Northern Mariana Islands', code: 'MP' },
      { name: 'Norway', code: 'NO' },
      { name: 'Oman', code: 'OM' },
      { name: 'Pakistan', code: 'PK' },
      { name: 'Palau', code: 'PW' },
      { name: 'Palestine', code: 'PS' },
      { name: 'Panama', code: 'PA' },
      { name: 'Papua New Guinea', code: 'PG' },
      { name: 'Paraguay', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Philippines', code: 'PH' },
      { name: 'Pitcairn Islands', code: 'PN' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Puerto Rico', code: 'PR' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Romania', code: 'RO' },
      { name: 'Russia', code: 'RU' },
      { name: 'Rwanda', code: 'RW' },
      { name: 'Réunion', code: 'RE' },
      { name: 'Samoa', code: 'WS' },
      { name: 'San Marino', code: 'SM' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Senegal', code: 'SN' },
      { name: 'Serbia', code: 'RS' },
      { name: 'Seychelles', code: 'SC' },
      { name: 'Sierra Leone', code: 'SL' },
      { name: 'Singapore', code: 'SG' },
      { name: 'Sint Maarten', code: 'SX' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Solomon Islands', code: 'SB' },
      { name: 'Somalia', code: 'SO' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'South Georgia & South Sandwich Islands', code: 'GS' },
      { name: 'South Korea', code: 'KR' },
      { name: 'South Sudan', code: 'SS' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sri Lanka', code: 'LK' },
      { name: 'St. Barthélemy', code: 'BL' },
      { name: 'St. Helena', code: 'SH' },
      { name: 'St. Kitts & Nevis', code: 'KN' },
      { name: 'St. Lucia', code: 'LC' },
      { name: 'St. Martin', code: 'MF' },
      { name: 'St. Pierre & Miquelon', code: 'PM' },
      { name: 'St. Vincent & Grenadines', code: 'VC' },
      { name: 'Sudan', code: 'SD' },
      { name: 'Suriname', code: 'SR' },
      { name: 'Svalbard & Jan Mayen', code: 'SJ' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Syria', code: 'SY' },
      { name: 'São Tomé & Príncipe', code: 'ST' },
      { name: 'Taiwan', code: 'TW' },
      { name: 'Tajikistan', code: 'TJ' },
      { name: 'Tanzania', code: 'TZ' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Timor-Leste', code: 'TL' },
      { name: 'Togo', code: 'TG' },
      { name: 'Tokelau', code: 'TK' },
      { name: 'Tonga', code: 'TO' },
      { name: 'Trinidad & Tobago', code: 'TT' },
      { name: 'Tunisia', code: 'TN' },
      { name: 'Turkey', code: 'TR' },
      { name: 'Turkmenistan', code: 'TM' },
      { name: 'Turks & Caicos Islands', code: 'TC' },
      { name: 'Tuvalu', code: 'TV' },
      { name: 'U.S. Outlying Islands', code: 'UM' },
      { name: 'U.S. Virgin Islands', code: 'VI' },
      { name: 'Uganda', code: 'UG' },
      { name: 'Ukraine', code: 'UA' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'United States', code: 'US' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Uzbekistan', code: 'UZ' },
      { name: 'Vanuatu', code: 'VU' },
      { name: 'Vatican City', code: 'VA' },
      { name: 'Venezuela', code: 'VE' },
      { name: 'Vietnam', code: 'VN' },
      { name: 'Wallis & Futuna', code: 'WF' },
      { name: 'Western Sahara', code: 'EH' },
      { name: 'Yemen', code: 'YE' },
      { name: 'Zambia', code: 'ZM' },
      { name: 'Zimbabwe', code: 'ZW' },
      { name: 'Åland Islands', code: 'AX' },
    ],
    [],
  );

  const filtered = useMemo(() => {
    if (!query) return countries;
    const q = query.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  const renderItem: ListRenderItem<Country> = ({ item }) => (
    <TouchableOpacity onPress={() => onSelect?.(item)} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.rowText, { color: theme.colors.text.primary, fontSize: theme.typography.sizes.md }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBack} style={styles.backTouch}>
            <ChevronLeft color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Select a country</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.secondary}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: theme.colors.text.primary, borderColor: theme.colors.border }]}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.name}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backTouch: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 36,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    height: 40,
    borderRadius: 50,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 120,
  },
  row: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
});

export default CountryPicker;

export const formatDateToDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-US', options);
};

export const formatLongDateToDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const formatMutualFollowersText = (names: string[], totalCount: number): string => {
  if (names.length === 0) return '';

  const remaining = totalCount - names.length;

  if (names.length === 1) {
    if (remaining > 0) {
      return `Followed by ${names[0]} and ${remaining} other${remaining === 1 ? '' : 's'}`;
    }
    return `Followed by ${names[0]}`;
  }

  if (names.length === 2) {
    if (remaining > 0) {
      return `Followed by ${names[0]}, ${names[1]}, and ${remaining} other${remaining === 1 ? '' : 's'}`;
    }
    return `Followed by ${names[0]} and ${names[1]}`;
  }

  // For 3 or more names shown
  const displayedNames = names.slice(0, 3).join(', ');
  if (remaining > 0) {
    return `Followed by ${displayedNames}, and ${remaining} other${remaining === 1 ? '' : 's'}`;
  }
  return `Followed by ${displayedNames}`;
};

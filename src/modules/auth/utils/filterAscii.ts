export const filterAsciiOnly = (value: string): string => {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[^\x00-\x7F]/g, '');
};

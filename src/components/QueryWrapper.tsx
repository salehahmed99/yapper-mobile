import { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import LoadingIndicator from './LoadingIndicator';

interface IQueryWrapperProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorMsg?: string;
}
const QueryWrapper = <T,>(props: IQueryWrapperProps<T>) => {
  const { query, children, loadingComponent, errorMsg } = props;
  const { theme } = useTheme();

  const { isPending, data, isError } = query;

  if (isPending) {
    return loadingComponent || <LoadingIndicator />;
  }
  if (isError) {
    return <Text style={{ color: theme.colors.error }}>{errorMsg || 'An error occurred'}</Text>;
  }

  return <>{children(data)}</>;
};

export default QueryWrapper;

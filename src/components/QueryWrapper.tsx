import { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import LoadingIndicator from './LoadingIndicator';

interface IQueryWrapperProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}
const QueryWrapper = <T,>(props: IQueryWrapperProps<T>) => {
  const { query, children, loadingComponent, errorComponent } = props;

  const { isPending, data, isError } = query;

  if (isPending) {
    return loadingComponent || <LoadingIndicator />;
  }
  if (isError) {
    return errorComponent;
  }

  return <>{children(data)}</>;
};

export default QueryWrapper;

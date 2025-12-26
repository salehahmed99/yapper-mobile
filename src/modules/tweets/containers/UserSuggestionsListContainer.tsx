import React from 'react';
import { SuggestionsProvidedProps } from 'react-native-controlled-mentions';
import { useSearchUsers } from '../../search/hooks/useSearchUsers';
import UserSuggestionsList from '../components/UserSuggestionsList';

interface IUserSuggestionsListContainerProps extends SuggestionsProvidedProps {
  onCloseModal: () => void;
}
const UserSuggestionsListContainer: React.FC<IUserSuggestionsListContainerProps> = (props) => {
  const { keyword } = props;
  const usersQuery = useSearchUsers({
    query: keyword || '',
    limit: 10,
    enabled: keyword !== undefined && keyword.length > 0,
  });

  const users = usersQuery.data?.pages.flatMap((page) => page.data.data);

  if (!users) return null;
  return <UserSuggestionsList users={users} {...props} />;
};

export default UserSuggestionsListContainer;

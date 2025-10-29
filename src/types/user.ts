export interface IUserDTO {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  phone_number?: string;
  github_id?: string;
  facebook_id?: string;
  google_id?: string;
  avatar_url?: string;
  is_following?: false;
  is_follower?: false;
  is_muted?: false;
  is_blocked?: false;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  phoneNumber?: string;
  githubId?: string;
  facebookId?: string;
  googleId?: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  isFollower?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
}

function mapUserDTOToUser(userDTO: IUserDTO): IUser {
  return {
    id: userDTO.id,
    email: userDTO.email,
    name: userDTO.name,
    username: userDTO.username,
    bio: userDTO.bio,
    phoneNumber: userDTO.phone_number,
    githubId: userDTO.github_id,
    facebookId: userDTO.facebook_id,
    googleId: userDTO.google_id,
    avatarUrl: userDTO.avatar_url,
    isFollowing: userDTO.is_following,
    isFollower: userDTO.is_follower,
    isMuted: userDTO.is_muted,
    isBlocked: userDTO.is_blocked,
  };
}

export { mapUserDTOToUser };

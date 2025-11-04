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
  cover_url?: string;
  birth_date?: string;
  language?: string;
  verified?: boolean;
  country?: string;
  online?: boolean;
  created_at?: string;
  updated_at?: string;
  followers?: number;
  following?: number;
  is_following?: boolean;
  is_follower?: boolean;
  is_muted?: boolean;
  is_blocked?: boolean;
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
  coverUrl?: string;
  birthDate?: string;
  language?: string;
  verified?: boolean;
  country?: string;
  online?: boolean;
  createdAt?: string;
  updatedAt?: string;
  followers?: number;
  following?: number;
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
    coverUrl: userDTO.cover_url,
    birthDate: userDTO.birth_date,
    language: userDTO.language,
    verified: userDTO.verified,
    country: userDTO.country,
    online: userDTO.online,
    createdAt: userDTO.created_at,
    updatedAt: userDTO.updated_at,
    followers: userDTO.followers,
    following: userDTO.following,
    isFollowing: userDTO.is_following,
    isFollower: userDTO.is_follower,
    isMuted: userDTO.is_muted,
    isBlocked: userDTO.is_blocked,
  };
}

export { mapUserDTOToUser };

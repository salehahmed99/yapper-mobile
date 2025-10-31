import { IUser, IUserDTO } from '@/src/types/user';

interface IGetMyUserResponseDTO {
  data: {
    user_id: string;
    name: string;
    username: string;
    bio: string;
    avatar_url: string;
    cover_url: string;
    country: string | null;
    created_at: string;
    followers_count: number;
    following_count: number;
  };
  count: number;
  message: string;
}

interface IGetMyUserResponse {
  data: IUser;
  count: number;
  message: string;
}

function mapGetMyUserResponseDTOToResponse(dto: IGetMyUserResponseDTO): IGetMyUserResponse {
  const userDTO: IUserDTO = {
    id: dto.data.user_id,
    email: '', // Not provided in this endpoint
    name: dto.data.name,
    username: dto.data.username,
    bio: dto.data.bio,
    avatar_url: dto.data.avatar_url,
    cover_url: dto.data.cover_url,
    country: dto.data.country || undefined,
    created_at: dto.data.created_at,
    followers: dto.data.followers_count,
    following: dto.data.following_count,
  };

  return {
    data: {
      id: userDTO.id,
      email: userDTO.email,
      name: userDTO.name,
      username: userDTO.username,
      bio: userDTO.bio,
      avatarUrl: userDTO.avatar_url,
      coverUrl: userDTO.cover_url,
      country: userDTO.country,
      createdAt: userDTO.created_at,
      followers: userDTO.followers,
      following: userDTO.following,
    },
    count: dto.count,
    message: dto.message,
  };
}

export { IGetMyUserResponse, IGetMyUserResponseDTO, mapGetMyUserResponseDTOToResponse };

// Get User By ID Types
interface IGetUserByIdResponseDTO {
  data: {
    user_id: string;
    name: string;
    username: string;
    bio: string;
    avatar_url: string;
    cover_url: string;
    country: string | null;
    created_at: string;
    followers_count: number;
    following_count: number;
    is_follower: boolean;
    is_following: boolean;
    is_muted: boolean;
    is_blocked: boolean;
    top_mutual_followers: unknown[];
    mutual_followers_count: string;
  };
  count: number;
  message: string;
}

interface IUserProfile extends IUser {
  isFollower: boolean;
  isFollowing: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  topMutualFollowers: unknown[];
  mutualFollowersCount: number;
}

interface IGetUserByIdResponse {
  data: IUserProfile;
  count: number;
  message: string;
}

function mapGetUserByIdResponseDTOToResponse(dto: IGetUserByIdResponseDTO): IGetUserByIdResponse {
  return {
    data: {
      id: dto.data.user_id,
      email: '', // Not provided in this endpoint
      name: dto.data.name,
      username: dto.data.username,
      bio: dto.data.bio,
      avatarUrl: dto.data.avatar_url,
      coverUrl: dto.data.cover_url,
      country: dto.data.country || undefined,
      createdAt: dto.data.created_at,
      followers: dto.data.followers_count,
      following: dto.data.following_count,
      isFollower: dto.data.is_follower,
      isFollowing: dto.data.is_following,
      isMuted: dto.data.is_muted,
      isBlocked: dto.data.is_blocked,
      topMutualFollowers: dto.data.top_mutual_followers,
      mutualFollowersCount: parseInt(dto.data.mutual_followers_count, 10) || 0,
    },
    count: dto.count,
    message: dto.message,
  };
}

export { IGetUserByIdResponse, IGetUserByIdResponseDTO, IUserProfile, mapGetUserByIdResponseDTOToResponse };

// Followers List Types
interface IFollowerUserDTO {
  user_id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar_url: string;
  is_following: boolean;
  is_follower: boolean;
  is_muted: boolean;
  is_blocked: boolean;
}

interface IFollowerUser {
  id: string;
  name: string;
  username: string;
  bio?: string;
  avatarUrl: string;
  isFollowing: boolean;
  isFollower: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

interface IGetFollowersListResponseDTO {
  data: IFollowerUserDTO[];
  count: number;
  message: string;
}

interface IGetFollowersListResponse {
  data: IFollowerUser[];
  count: number;
  message: string;
}

interface IGetFollowersListParams {
  userId: string;
  pageOffset?: number;
  pageSize?: number;
  following?: boolean;
}

function mapFollowerUserDTOToFollowerUser(dto: IFollowerUserDTO): IFollowerUser {
  return {
    id: dto.user_id,
    name: dto.name,
    username: dto.username,
    bio: dto.bio || undefined,
    avatarUrl: dto.avatar_url,
    isFollowing: dto.is_following,
    isFollower: dto.is_follower,
    isMuted: dto.is_muted,
    isBlocked: dto.is_blocked,
  };
}

function mapGetFollowersListResponseDTOToResponse(dto: IGetFollowersListResponseDTO): IGetFollowersListResponse {
  return {
    data: dto.data.map(mapFollowerUserDTOToFollowerUser),
    count: dto.count,
    message: dto.message,
  };
}

export {
  IFollowerUser,
  IFollowerUserDTO,
  IGetFollowersListParams,
  IGetFollowersListResponse,
  IGetFollowersListResponseDTO,
  mapGetFollowersListResponseDTOToResponse,
};

// Following List Types (reusing the same structure as followers)
interface IGetFollowingListParams {
  userId: string;
  pageOffset?: number;
  pageSize?: number;
}

interface IGetFollowingListResponse {
  data: IFollowerUser[];
  count: number;
  message: string;
}

interface IGetFollowingListResponseDTO {
  data: IFollowerUserDTO[];
  count: number;
  message: string;
}

function mapGetFollowingListResponseDTOToResponse(dto: IGetFollowingListResponseDTO): IGetFollowingListResponse {
  return {
    data: dto.data.map(mapFollowerUserDTOToFollowerUser),
    count: dto.count,
    message: dto.message,
  };
}

export {
  IGetFollowingListParams,
  IGetFollowingListResponse,
  IGetFollowingListResponseDTO,
  mapGetFollowingListResponseDTOToResponse,
};

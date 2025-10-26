export interface IUserDTO {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  github_id?: string;
  facebook_id?: string;
  google_id?: string;
  avatar_url?: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  githubId?: string;
  facebookId?: string;
  googleId?: string;
  avatarUrl?: string;
}

function mapUserDTOToUser(userDTO: IUserDTO): IUser {
  return {
    id: userDTO.id,
    email: userDTO.email,
    name: userDTO.name,
    phoneNumber: userDTO.phone_number,
    githubId: userDTO.github_id,
    facebookId: userDTO.facebook_id,
    googleId: userDTO.google_id,
    avatarUrl: userDTO.avatar_url,
  };
}

export { mapUserDTOToUser };

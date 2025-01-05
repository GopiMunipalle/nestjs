export class UserResponse {
  name: string;
  email: string;
  id: number;
  role: string;
  number: string;
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
}

export class UserResponseDto {
  data: UserResponse;
}

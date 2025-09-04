export interface RegisterUserResponse {
  status: number;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    refreshToken: string;
    accessToken: string;
  };
}

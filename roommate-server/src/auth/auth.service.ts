import prisma from "@common/utils/prisma";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import {
  generateTokens,
  getNewAccessToken,
  validateAccessToken,
  validateRefreshToken,
} from "@common/utils/jwtHandler";
import User from "@src/users/types/User";
import { ApiResponse } from "@common/utils/ApiResponse";
import { BCRYPT_SALT_ROUNDS } from "@common/config";
import refreshTokenSetter from "@src/auth/refreshTokenSetter";
import { Response } from "express";
interface RegisterUserResponse {
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
interface UserLoginResponse {
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
class AuthService {
  private prisma = prisma;

  constructor() {}

  public async registerUser(
    name: string,
    email: string,
    password: string
  ): Promise<RegisterUserResponse | ApiResponse> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser)
        return ApiResponse.error(
          "Email already registered",
          StatusCodes.CONFLICT
        );

      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      const createdUser: User = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      if (!createdUser)
        return ApiResponse.error("Unable to create user", StatusCodes.CONFLICT);

      const { accessToken, refreshToken } = generateTokens({
        userId: createdUser.id,
      });

      return ApiResponse.success(
        {
          responseData: {
            name: createdUser.name,
            email: createdUser.email,
            accessToken: accessToken,
          },
          refreshToken: refreshToken,
        },
        "User successfully created"
      );
    } catch (error) {
      throw Error("User not created: auth.service.ts");
    }
  }

  public async login(
    email: string,
    password: string
  ): Promise<UserLoginResponse | ApiResponse> {
    try {
      const user: User | null = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user)
        return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched)
        return ApiResponse.error("Password mismatch", StatusCodes.FORBIDDEN);

      const { accessToken, refreshToken } = generateTokens({
        userId: user.id,
      });

      return ApiResponse.success(
        {
          responseData: {
            accessToken: accessToken,
            email: user.email,
          },
          refreshToken: refreshToken,
        },
        "Welcome to Roommate " + user.name
      );
    } catch (error) {
      return ApiResponse.error("Unable to login");
    }
  }

  public async refresh(refreshToken: any) {
    try {
      const decodedRefreshToken = await validateRefreshToken(refreshToken);

      if (!decodedRefreshToken) ApiResponse.error("refresh token invalid");

      const { userId } = decodedRefreshToken;

      const accessToken = getNewAccessToken({ userId: userId });

      return ApiResponse.success({
        accessToken: accessToken,
      });
    } catch (error) {
      console.error(error);
      return ApiResponse.error(
        "Unable to refresh token: " + error,
        StatusCodes.UNAUTHORIZED
      );
    }
  }
}

export default new AuthService();

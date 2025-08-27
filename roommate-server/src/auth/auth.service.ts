import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import prisma from "@common/utils/prisma";
import {
  generateTokens,
  getNewAccessToken,
  validateRefreshToken,
} from "@common/utils/jwtHandler";
import User from "@src/users/types/User";
import { ApiResponse } from "@common/utils/ApiResponse";
import { BCRYPT_SALT_ROUNDS } from "@common/config";
import { RegisterUserResponse } from "@src/auth/types/RegisterUserResponse";
import { UserLoginResponse } from "@src/auth/types/UserLoginResponse";

export class AuthService {
  private static prisma = prisma;

  static async registerUser(
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
        userId: createdUser.userId,
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

  static async login(
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
        userId: user.userId,
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

  static async refresh(refreshToken: any) {
    try {
      const decodedRefreshToken = await validateRefreshToken(refreshToken);

      if (!decodedRefreshToken) ApiResponse.error("refresh token invalid");

      const { userId } = decodedRefreshToken;

      if (!userId || userId === "")
        ApiResponse.error("unable to get the user id from the token");

      const accessToken = await getNewAccessToken({ userId: userId });

      return ApiResponse.success({
        userId: userId,
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

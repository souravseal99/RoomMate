import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import prisma from "@common/utils/prisma";
import {
  generateTokens,
  getNewAccessToken,
  validateRefreshToken,
} from "@common/utils/jwtHandler";
import { User } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import { BCRYPT_SALT_ROUNDS } from "@common/config";
import { RegisterUserResponse } from "@src/auth/types/RegisterUserResponse";
import { UserLoginResponse } from "@src/auth/types/UserLoginResponse";
import { UserRepo } from "@src/users/user.repo";

export class AuthService {
  private static prisma = prisma;

  static async registerUser(
    name: string,
    email: string,
    password: string
  ): Promise<RegisterUserResponse | ApiResponse> {
    try {
      const existingUser: User | null = await UserRepo.getUserByEmail(email);

      if (existingUser)
        return ApiResponse.error(
          "Email already registered",
          StatusCodes.CONFLICT
        );

      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

      const createdUser: User = await UserRepo.createUser(
        name,
        email,
        hashedPassword
      );

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
      const user: User | null = await UserRepo.getUserByEmail(email);

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
        `Welcome to Roommate ${user.name}`
      );
    } catch (error) {
      return ApiResponse.error("Unable to login");
    }
  }

  static async refresh(refreshToken: any) {
    try {
      const decodedRefreshToken = await validateRefreshToken(refreshToken);

      if (!decodedRefreshToken) ApiResponse.error("Refresh token invalid");

      const { userId } = decodedRefreshToken;

      if (!userId || userId === "")
        ApiResponse.error("Unable to get the user id from the token");

      const accessToken = await getNewAccessToken({ userId: userId });

      return ApiResponse.success({
        userId: userId,
        accessToken: accessToken,
      });
    } catch (error) {
      console.error(error);
      return ApiResponse.error(
        `Unable to refresh the token: ${error}`,
        StatusCodes.UNAUTHORIZED,
        { refreshToken: refreshToken }
      );
    }
  }
}

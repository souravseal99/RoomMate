import prisma from "@common/utils/prisma";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@src/users/Types/User";
import { ApiResponse } from "@common/utils/ApiResponse";
import { BCRYPT_SALT_ROUNDS } from "@common/config";

class AuthService {
  private prisma = prisma;

  constructor() {}

  public async registerUser(name: string, email: string, password: string) {
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

      return ApiResponse.success(
        {
          name: createdUser.name,
          email: createdUser.email,
        },
        "User successfully created"
      );
    } catch (error) {
      throw Error("User not created: auth.service.ts");
    }
  }

  public async login(email: string, password: string) {
    try {
      const user: User | null = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        const enteredPasswordHash = await bcrypt.hash(
          password,
          BCRYPT_SALT_ROUNDS
        );

        console.log(BCRYPT_SALT_ROUNDS);

        console.log(
          user.password,
          enteredPasswordHash,
          user.password === enteredPasswordHash
        );

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        console.log(isPasswordMatched, " :: is password matched");

        if (isPasswordMatched) {
          return ApiResponse.success("Welcome to Roommate " + user.name);
        } else {
          return ApiResponse.error("Password Incorrect", StatusCodes.FORBIDDEN);
        }
      }
      return ApiResponse.error("User not found !!!", StatusCodes.UNAUTHORIZED);
    } catch (error) {
      return ApiResponse.error("Unable to login");
    }
  }
}

export default new AuthService();

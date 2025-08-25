import prisma from "@common/utils/prisma";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "@src/users/Types/User";
import { ApiResponse } from "@common/utils/ApiResponse";

class AuthService {
  private prisma = prisma;

  constructor() {}

  public async registerUser(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser)
      return ApiResponse.error(
        "Email already registered",
        StatusCodes.CONFLICT
      );

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser: User = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      console.log(createdUser);

      return ApiResponse.success(
        {
          name: createdUser.name,
          email: createdUser.email,
        },
        "User successfully created"
      );
    } catch (error) {
      throw Error("User not created");
    }
  }
}

export default new AuthService();

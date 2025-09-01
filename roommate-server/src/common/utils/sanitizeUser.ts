import UserDto from "@src/common/dtos/UserDto";

export default function sanitizeUser(user: UserDto) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
  };
}

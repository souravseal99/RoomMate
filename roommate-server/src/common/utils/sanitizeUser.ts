import User from "@src/common/types/User";

export default function sanitizeUser(user: User) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
  };
}

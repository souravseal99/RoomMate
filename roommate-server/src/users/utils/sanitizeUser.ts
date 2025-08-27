import User from "@src/users/types/User";

export default function sanitizeUser(user: User) {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
  };
}

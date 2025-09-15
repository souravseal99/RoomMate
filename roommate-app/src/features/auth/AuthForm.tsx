// src/features/auth/AuthForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthFormInputData } from "@/features/auth/types";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});
const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

export function AuthForm({ mode, onSubmit }: Readonly<AuthFormInputData>) {
  const schema = mode === "register" ? registerSchema : loginSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "register"
        ? { name: "", email: "", password: "" }
        : { email: "", password: "" },
  });

  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/register");
  };
  const handleSignInClick = () => {
    navigate("/login");
  };

  return (
    <Card>
      <CardHeader className="text-left">
        {mode === "register" ? (
          <>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Enter your name, email and password below to register
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={handleSignInClick}>
                Sign In
              </Button>
            </CardAction>
          </>
        ) : (
          <>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={handleSignUpClick}>
                Sign Up
              </Button>
            </CardAction>
          </>
        )}
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-md mx-auto p-6"
        >
          {mode === "register" && (
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                {...form.register("name")}
                className="w-full border rounded-lg p-2"
                placeholder="John Doe"
              />
              <p className="text-sm text-red-600">
                {form.formState.errors.name?.message as string}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              {...form.register("email")}
              className="w-full border rounded-lg p-2"
              placeholder="you@example.com"
            />
            <p className="text-sm text-red-600">
              {form.formState.errors.email?.message as string}
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              {...form.register("password")}
              className="w-full border rounded-lg p-2"
              placeholder="********"
            />
            <p className="text-sm text-red-600">
              {form.formState.errors.password?.message as string}
            </p>
          </div>

          <Button
            variant="outline"
            type="submit"
            className="w-full rounded-lg p-2 bg-secondary hover:bg-primary hover:text-primary-foreground"
          >
            {mode === "register" ? "Register" : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

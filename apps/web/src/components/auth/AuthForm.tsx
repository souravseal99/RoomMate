import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthFormInputData } from "@/types/authTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, Mail, Lock, User } from "lucide-react";

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

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 right-20 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-300/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      
      <div className="absolute top-8 left-8 hidden lg:block animate-in fade-in slide-in-from-left-5 duration-700">
        <div className="flex items-center gap-3 text-blue-600 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg animate-bounce" style={{animationDuration: '3s'}}>
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">RoomMate</h2>
            <p className="text-xs text-gray-600">Shared Living Made Easy</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 hidden lg:flex flex-col gap-3 max-w-xs">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left-5 duration-700" style={{animationDelay: '200ms'}}>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0 animate-pulse"></div>
            <p className="text-sm text-gray-700">Track expenses and split bills effortlessly</p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left-5 duration-700" style={{animationDelay: '400ms'}}>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <p className="text-sm text-gray-700">Manage chores and household tasks</p>
          </div>
        </div>
      </div>
      
      <div className="absolute top-8 right-8 hidden lg:block animate-in fade-in slide-in-from-right-5 duration-700">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-xs hover:shadow-xl hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 animate-pulse">1000+</div>
            <p className="text-sm text-gray-600 mt-1">Happy Roommates</p>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/4 left-1/3 w-16 h-16 border-2 border-blue-300/30 rounded-lg rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
      <div className="absolute bottom-1/4 right-1/3 w-12 h-12 border-2 border-indigo-300/30 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
      
      <div className="w-full max-w-sm relative z-10">
        <div className="mb-6 text-center lg:hidden animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl hover:scale-110 transition-transform duration-300" style={{boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.5)'}}>
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">RoomMate</h1>
        </div>
        <Card className="rounded-xl shadow-lg bg-white/80 backdrop-blur-sm border border-white/20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {mode === "register" ? "Create an Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center pt-1">
              Enter your details to {mode === "register" ? "get started" : "sign in"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      {...form.register("name")}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input bg-background"
                      placeholder="Your name"
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.name?.message as string}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    {...form.register("email")}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input bg-background"
                    placeholder="your@email.com"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.email?.message as string}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    {...form.register("password")}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input bg-background"
                    placeholder="••••••••"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.password?.message as string}</p>
                )}
              </div>
              <Button type="submit" className="w-full cursor-pointer">
                {mode === "register" ? "Create Account" : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {mode === "register" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="underline text-primary font-medium cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="underline text-primary font-medium cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}

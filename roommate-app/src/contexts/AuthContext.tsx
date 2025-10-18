import api from "@/api/axios";
import TokenStore from "@/lib/TokenStore";
import {
  createContext,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  accessToken: string | null;
  setAccessToken?: (token: string | null) => void;
  email: string | null;
  name: string | null;
  login: (token: string, email?: string | null, name?: string | null) => void;
  logout: () => void;
  ready: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        setReady(false);

        // Only try refresh if session exists
        if (!TokenStore.hasSession()) {
          setReady(true);
          return;
        }

        const res = await api.get("/auth/refresh");
        const accessToken = res?.data?.accessToken;
        const userEmail = res?.data?.email;
        const userName = res?.data?.name;

        if (accessToken) {
          setAccessToken(accessToken);
          TokenStore.setToken(accessToken);
          setIsAuthenticated(true);
          if (userEmail) setEmail(userEmail);
          if (userName) setName(userName);
        } else {
          setIsAuthenticated(false);
          setEmail(null);
          setName(null);
          TokenStore.setToken(null);
        }
      } catch (e) {
        setIsAuthenticated(false);
        setEmail(null);
        setName(null);
        TokenStore.setToken(null);
      }
      setReady(true);
    };

    tryRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token: string, email?: string, name?: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    if (email !== undefined) setEmail(email);
    if (name !== undefined) setName(name);
    TokenStore.setToken(token);
  };

  //TODO - Implement logout API call
  const logout = async () => {
    TokenStore.clearSession();
    setAccessToken(null);
    setEmail(null);
    setName(null);
    setIsAuthenticated(false);
    TokenStore.setToken(null);

    // try {
    //   setReady(false);
    //   const res = await Axios.get("/auth/logout");
    //   if (res.status === 200) {
    //     console.log("Logout successful");
    //     setReady(true);
    //   } else {
    //     console.error("Logout failed with status: ", res);
    //   }
    // } catch (error) {
    //   console.error("Logout failed: ", error);
    // } finally {
    //   setAccessToken(null);
    //   setEmail(null);
    //   setIsAuthenticated(false);
    //   TokenStore.setToken(null);
    // }
  };

  const providerValues = useMemo(
    () =>
      ({
        isAuthenticated,
        accessToken,
        setAccessToken,
        email,
        name,
        login,
        logout,
        ready,
      } as AuthContextType),
    [isAuthenticated, accessToken, email, name, ready, login, logout, setAccessToken]
  ); // to escape from the re-renders

  return (
    <AuthContext.Provider value={providerValues}>
      {children}
    </AuthContext.Provider>
  );
}

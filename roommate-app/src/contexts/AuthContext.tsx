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
  login: (token: string, email?: string | null) => void;
  logout: () => void;
  ready: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   // TokenStore.accessToken = accessToken;
  //   setReady(true);
  // }, [accessToken]);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        setReady(false);

        const res = await api.get("/auth/refresh");
        const accessToken = res?.data?.accessToken;

        if (accessToken) {
          setAccessToken(accessToken);
          console.log("Refresh attempt:", accessToken);
          TokenStore.setToken(accessToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setEmail(null);
          TokenStore.setToken(null);
        }
      } catch (e) {
        setIsAuthenticated(false);
        setEmail(null);
        TokenStore.setToken(null);
      }
      setReady(true); // Only set ready after refresh attempt
    };

    tryRefresh();
    console.log("AuthContext - Mounted:: ", accessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //TODO - Try refresh on first load if no token in memory

  const login = (token: string, email?: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    if (email !== undefined) setEmail(email);
    TokenStore.setToken(token);
  };

  //TODO - Implement logout API call
  const logout = async () => {
    setAccessToken(null);
    setEmail(null);
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
        login,
        logout,
        ready,
      } as AuthContextType),
    [isAuthenticated, accessToken, email, ready, login, logout, setAccessToken]
  ); // to escape from the re-renders

  return (
    <AuthContext.Provider value={providerValues}>
      {children}
    </AuthContext.Provider>
  );
}

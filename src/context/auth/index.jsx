import Cookies from "js-cookies";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = Cookies.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return { ...decoded, token };
      } catch (error) {
        Cookies.removeItem("token");
        return null;
      }
    }
    return null;
  });

  const login = (token) => {
    const decoded = jwtDecode(token);
    Cookies.setItem("token", token);
    setUser({ ...decoded, token });
  };

  const logout = () => {
    Cookies.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

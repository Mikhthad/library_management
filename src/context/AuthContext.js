import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/users/me/",
          { withCredentials: true }
        );

        if (res.data.isAuthenticated) {
          setUser({
            username: res.data.username,
            role: res.data.role,
          });
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/users/logout/",
        {},                        
        { withCredentials: true }  
      );
    } catch {}

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

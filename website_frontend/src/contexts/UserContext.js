import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

// Create the context
const UserContext = createContext();

// Custom hook for accessing the context easily
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const [cookies, setCookie] = useCookies(['user']);
  const [user, setUser] = useState(null);

  // Effect to sync user state with cookies
  useEffect(() => {
    if (cookies.user) {
      setUser(cookies.user);
    } else {
      setUser(null);
    }
  }, [cookies.user]);

  return (
    <UserContext.Provider value={{ user, setCookie }}>
      {children}
    </UserContext.Provider>
  );
};

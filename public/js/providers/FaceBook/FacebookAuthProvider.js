import React, { createContext, useState, useEffect } from 'react';
import FacebookAuth from './FacebookAuth';

const FacebookAuthContext = createContext();

const FacebookAuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appId = 'YOUR_APP_ID'; // Substitua pelo seu App ID

  useEffect(() => {
    const fbAuth = new FacebookAuth(appId);
    fbAuth.init().then(() => {
      setAuth(fbAuth);
    });
  }, [appId]);

  const login = () => {
    if (auth) {
      auth.login().then(userInfo => {
        setUser(userInfo);
        setIsAuthenticated(true);
      }).catch(error => {
        console.error('Login failed:', error);
      });
    }
  };

  const checkLoginState = () => {
    if (auth) {
      auth.checkLoginState().then(response => {
        auth.getUserInfo().then(userInfo => {
          setUser(userInfo);
          setIsAuthenticated(true);
        });
      }).catch(() => {
        setIsAuthenticated(false);
      });
    }
  };

  return (
    <FacebookAuthContext.Provider value={{ user, isAuthenticated, login, checkLoginState }}>
      {children}
    </FacebookAuthContext.Provider>
  );
};

export { FacebookAuthProvider, FacebookAuthContext };

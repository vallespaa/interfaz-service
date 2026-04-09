/**
 * @file AuthContext.jsx
 * @author Diego Vallespín Blas
 * @date 2026-04
 * @description Proveedor de autenticación del conductor y la persistencia de sesión.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setToken, removeToken, validarToken, login as apiLogin, logout as apiLogout } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [conductor, setConductor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intenta reanudar sesión si hay token guardado
  useEffect(() => {
    const token = sessionStorage.getItem("ev_token");
    if (!token) { setLoading(false); return; }
    setToken(token);
    validarToken()
      .then(({ conductor }) => setConductor(conductor))
      .catch(() => sessionStorage.removeItem("ev_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credenciales) => {
    const tokenData = await apiLogin(credenciales);
    sessionStorage.setItem("ev_token", tokenData.token);
    const conductorData = await validarToken();
    setConductor(conductorData);
    return { ...tokenData, conductor: conductorData };
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    sessionStorage.removeItem("ev_token");
    setConductor(null);
  }, []);

  return (
    <AuthContext.Provider value={{ conductor, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

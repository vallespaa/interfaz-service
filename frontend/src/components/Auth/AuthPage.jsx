/**
 * @file AuthPage.jsx
 * @author Diego Vallespín Blas
 * @date 2026-04
 * @description Muestra el login y registro de un usuario.
 */

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { registrarConductor } from "../../api";
import { ApiError } from "../../api";
import styles from "./Auth.module.css";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Campos
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error de conexión");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registrarConductor({ nombre, email, password });
      await login({ email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error de conexión");
    } finally { setLoading(false); }
  };

  const resetToLogin = () => {
    setMode("login"); setError("");
    setNombre(""); setEmail(""); setPassword("");
  };

  return (
    <div className={styles.page}>
      {/* Fondo decorativo */}
      <div className={styles.bg}>
        <div className={styles.bgGlow} />
        <div className={styles.bgGrid} />
      </div>

      <div className={styles.card + " animate-fadeUp"}>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>EV<span>charge</span></span>
        </div>

        {mode === "login" ? (
          <>
            <h1 className={styles.title}>Accede a tu cuenta</h1>
            <p className={styles.subtitle}>Gestiona tu movilidad eléctrica</p>

            <form onSubmit={handleLogin} className={styles.form + " stagger"}>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="conductor@email.com" required autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password" />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : "Iniciar sesión"}
              </button>
            </form>

            <p className={styles.switchMode}>
              ¿No tienes cuenta?{" "}
              <button onClick={() => { setMode("register"); setError(""); }}>
                Regístrate
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleRegister} className={styles.form + " stagger animate-fadeUp"}>
              <h2 className={styles.title}>Crea tu cuenta</h2>
              <div className={styles.field}>
                <label>Nombre completo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ana García" required />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ana@email.com" required />
              </div>
              <div className={styles.field}>
                <label>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" required minLength={8} />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : "Crear cuenta"}
              </button>
            </form>

            <p className={styles.switchMode}>
              ¿Ya tienes cuenta?{" "}
              <button onClick={resetToLogin}>Inicia sesión</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

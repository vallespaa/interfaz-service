/**
 * @file AppContext.jsx
 * @author Diego Vallespín Blas
 * @date 2026-04
 * @description Gestión del estado de la interfaz.
 */

import { createContext, useContext, useState, useCallback } from "react";

// Panel modes del panel derecho
export const PANEL_MODE = {
  ZONAS: "ZONAS",     // lista de zonas cercanas
  DETALLE: "DETALLE", // detalle de una zona
  RESERVA: "RESERVA", // reserva activa con timer
  CARGA: "CARGA",     // sesión de carga activa
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [panelMode, setPanelMode]  = useState(PANEL_MODE.ZONAS);
  const [zonaSeleccionada, setZona] = useState(null);
  const [reservaActiva, setReserva] = useState(null);
  const [cargaActiva, setCarga] = useState(null);     // { idCarga, vehiculo, ... }
  const [notifCount, setNotifCount] = useState(0);

  const seleccionarZona = useCallback((zona) => {
    setZona(zona);
    setPanelMode(PANEL_MODE.DETALLE);
  }, []);

  const activarReserva = useCallback((reserva) => {
    setReserva(reserva);
    setPanelMode(PANEL_MODE.RESERVA);
  }, []);

  const cancelarReserva = useCallback(() => {
    setReserva(null);
    setPanelMode(PANEL_MODE.DETALLE);
  }, []);

  const iniciarCarga = useCallback((carga) => {
    setCarga(carga);
    setReserva(null);
    setPanelMode(PANEL_MODE.CARGA);
  }, []);

  const finalizarCarga = useCallback(() => {
    setCarga(null);
    setZona(null);
    setPanelMode(PANEL_MODE.ZONAS);
  }, []);

  const volverAZonas = useCallback(() => {
    setZona(null);
    setPanelMode(PANEL_MODE.ZONAS);
  }, []);

  return (
    <AppContext.Provider value={{
      panelMode,
      zonaSeleccionada,
      reservaActiva,
      cargaActiva,
      notifCount,
      setNotifCount,
      seleccionarZona,
      activarReserva,
      cancelarReserva,
      iniciarCarga,
      finalizarCarga,
      volverAZonas,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

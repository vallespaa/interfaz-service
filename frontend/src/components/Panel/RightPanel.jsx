import { useApp, PANEL_MODE } from "../../context/AppContext";
import ZonasList from "./ZonasList";
import ZonaDetalle from "./ZonaDetalle";
import ReservaPanel from "./ReservaPanel";
import CargaPanel from "./CargaPanel";
import styles from "./Panel.module.css";

export default function RightPanel() {
  const { panelMode } = useApp();

  return (
    <div className={styles.panel}>
      {panelMode === PANEL_MODE.ZONAS   && <ZonasList />}
      {panelMode === PANEL_MODE.DETALLE && <ZonaDetalle />}
      {panelMode === PANEL_MODE.RESERVA && <ReservaPanel />}
      {panelMode === PANEL_MODE.CARGA   && <CargaPanel />}
    </div>
  );
}

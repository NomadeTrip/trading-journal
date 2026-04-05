/**
 * ContextMenuBlocker — Trading Journal Pro
 * Componente silencioso que bloquea el clic derecho en toda la aplicación
 */

import { useEffect } from "react";

export default function ContextMenuBlocker() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return null;
}
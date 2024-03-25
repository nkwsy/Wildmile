import { useEffect, useContext } from "react";
import { CanvasContext } from "./context_mod_map";

export function useFetchModules(triggerUpdate) {
  const { setModules } = useContext(CanvasContext);

  useEffect(() => {
    async function fetchData() {
      const pathname = window.location.pathname;
      const response = await fetch(`${pathname}/edit`);
      const data = await response.json();
      setModules(data);
    }

    fetchData();
  }, [triggerUpdate, setModules]);
}

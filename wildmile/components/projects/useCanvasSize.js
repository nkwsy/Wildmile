import { useState, useEffect } from "react";

export function useCanvasSize(defaultWidth = 1200, defaultHeight = 1200) {
  const [containerSize, setContainerSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : defaultWidth,
    height: typeof window !== "undefined" ? window.innerHeight : defaultHeight,
  });

  useEffect(() => {
    function handleResize() {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return containerSize;
}

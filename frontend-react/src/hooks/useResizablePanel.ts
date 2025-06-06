import { useRef, useState, useEffect } from "react";

export const useResizablePanel = (initialWidth = 400) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 250 && newWidth < 700) {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResizing = () => {
    isResizing.current = true;
  };

  return { width, startResizing };
};

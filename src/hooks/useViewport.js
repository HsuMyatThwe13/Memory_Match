import { useState, useEffect } from "react";

const read = () => ({ w: window.innerWidth, h: window.innerHeight });

export default function useViewport() {
  const [size, setSize] = useState(read);

  useEffect(() => {
    const update = () => setSize(read());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return size;
}

"use client";

import * as React from "react";

export function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    function update() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

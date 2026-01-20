"use client";

import React, { useRef, useState, useEffect } from "react";
import ASCIIText from "@/components/ui/AsciiText";
import VariableProximity from "@/components/ui/VariableProximity";

export default function DocsHeader() {
  const containerRef = useRef(null);
  const [planeBaseHeight, setPlaneBaseHeight] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPlaneBaseHeight(2.5);
      } else if (window.innerWidth < 1024) {
        setPlaneBaseHeight(4);
      } else {
        setPlaneBaseHeight(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="relative z-10">
        <ASCIIText
          text="K.D.S.M"
          enableWaves={false}
          planeBaseHeight={planeBaseHeight}
          textColor={"#fdf9f3"}
        />
      </div>

      <header className="flex justify-center items-center h-16 gap-10 mb-10 pt-10 w-full">
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: "flex",
          }}
        >
          <VariableProximity
            label={"• Keyed Dynamic Shift Matrix •"}
            className={"sm:text-2xl text-lg"}
            containerRef={containerRef}
            radius={100}
            falloff="gaussian"
          />
        </div>
      </header>
    </>
  );
}
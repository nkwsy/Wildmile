"use client";
import React, { useContext, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import { CanvasContext } from "./context_mod_map";
import { useCanvasSize } from "./useCanvasSize";
import { useFetchModules } from "./useFetchModules";

export const CanvasBase = ({ children, width, height }) => {
  const { triggerUpdate } = useContext(CanvasContext);
  const [cols, setCols] = useState(width); // Set initial value of cols to width
  const [rows, setRows] = useState(height); // Set initial value of rows to height

  const gridRef = useRef(null);
  const modRef = useRef(null);

  useFetchModules(triggerUpdate);
  const value = {
    width,
    height,
    gridRef,
    modRef,
    cols,
    rows,
    setCols,
    setRows,
  };

  return (
    <div>
      <CanvasContext.Provider value={value}>
        <Stage ref={gridRef} width={width} height={height}>
          <Layer ref={modRef}></Layer>

          {children}
        </Stage>
      </CanvasContext.Provider>
    </div>
  );
};

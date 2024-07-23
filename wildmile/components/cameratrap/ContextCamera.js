"use client";

import React, { createContext, useContext, useState } from "react";

// Generic context creator
function createCtx(defaultValue) {
  const ctx = createContext(defaultValue);
  function Provider({ children }) {
    const [state, setState] = useState(defaultValue);
    return <ctx.Provider value={[state, setState]}>{children}</ctx.Provider>;
  }
  function useCtx() {
    const context = useContext(ctx);
    if (context === undefined) {
      throw new Error("useCtx must be used within a Provider");
    }
    return context;
  }
  return [Provider, useCtx];
}

// Contexts
const [CounterProvider, useCounter] = createCtx(0);
const [ImageProvider, useImage] = createCtx(null);
const [SelectionProvider, useSelection] = createCtx([]);

// Combined provider
function IdentificationProvider({ children }) {
  return (
    <CounterProvider>
      <ImageProvider>
        <SelectionProvider>{children}</SelectionProvider>
      </ImageProvider>
    </CounterProvider>
  );
}

export { IdentificationProvider, useCounter, useImage, useSelection };

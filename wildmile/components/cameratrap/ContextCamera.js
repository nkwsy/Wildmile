"use client";
"use client";

import React from "react";
const CounterContext = React.createContext([0, () => {}]);
const ImageContext = React.createContext(null);
const SelectionContext = React.createContext(null);

export function CounterProvider({ children }) {
  const [count, setCount] = React.useState(0);
  return (
    <CounterContext.Provider value={[count, setCount]}>
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const context = React.useContext(CounterContext);
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context;
}

// old use
import { createContext, useContext, useState, useReducer } from "react";
const ClientContext = createContext();
export default ClientContext;

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
// only grab selected state
// use like   const selectedModule = useClient('selectedModule');
export const useClientState = (propertyName) => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientState must be used within its Provider");
  }
  // Directly access the 'state' object and then the property
  const stateValue = context.state[propertyName];
  if (stateValue === undefined) {
    throw new Error(
      `The property "${propertyName}" does not exist in the state`
    );
  }
  return stateValue;
};

export const useClientStatePath = (path) => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientState must be used within its Provider");
  }

  // Split the path and reduce it to the nested value
  const stateValue = path.split(".").reduce((acc, part) => {
    if (acc && acc[part] !== undefined) {
      return acc[part];
    }
    throw new Error(`The path "${path}" could not be resolved in the context`);
  }, context);

  return stateValue;
};
// export const ClientProvider = ({ children }) => {
//   const [client, setClient] = useState({}); // Initial client state
//   //   const gridRef = useRef(null);
//   //   const stageRef = useRef();
//   const [stageHeight, setStageHeight] = useState(0);
//   const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
//   const [rotation, setRotation] = useState(0);
//   const [modules, setModules] = useState({});
//   const updateClient = (newData) => {
//     setClient((prevClient) => ({ ...prevClient, ...newData }));
//   };

//   return (
//     <ClientContext.Provider value={{ client, updateClient }}>
//       {children}
//     </ClientContext.Provider>
//   );
// };

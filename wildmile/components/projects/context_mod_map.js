"use client";
// contexts/ClientContext.js

import React, { createContext, useContext, useState } from "react";
// import React from "react";
const ClientContext = React.createContext();
export default ClientContext;
export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
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

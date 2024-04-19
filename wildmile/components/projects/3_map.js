import React, { useRef, useState } from "react";
import { extend } from "@react-three/fiber";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { MantineProvider, Card, Text } from "@mantine/core";

// A functional component that creates a grid cell
function GridCell({ position, color, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      {/* Use 'boxGeometry' instead of 'boxBufferGeometry' */}
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// A functional component that creates the entire grid
function Grid({ modules, onModuleSelect }) {
  return modules.map((module, index) => (
    <GridCell
      key={index}
      position={[module.x, 0, module.y]}
      color={module.color}
      onClick={() => onModuleSelect(module)}
    />
  ));
}

// The main component that sets up the Three.js Canvas
function ModMap() {
  // Dummy module data - replace with your actual data
  const modules = [
    { x: 0, y: 0, color: "purple" },
    { x: 0, y: 1, color: "green" },
    { x: 1, y: 1, color: "green" },

    { x: 3, y: 3, color: "green" },
    // Add more modules as necessary
  ];

  // State for selected module
  const [selectedModule, setSelectedModule] = useState(null);

  // This function is called when a grid cell is clicked
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  return (
    <MantineProvider>
      {selectedModule && (
        <Card style={{ position: "absolute", zIndex: 10, right: 0 }}>
          <Text>
            Selected Module: {selectedModule.x}, {selectedModule.y}
          </Text>
        </Card>
      )}
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Grid modules={modules} onModuleSelect={handleModuleSelect} />
      </Canvas>
    </MantineProvider>
  );
}

export default ModMap;

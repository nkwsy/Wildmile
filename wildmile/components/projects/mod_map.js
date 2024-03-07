import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";

// Draw a right triangle within a cell
const RightTriangle = ({ module, cellWidth, cellHeight, findColor }) => {
  // Calculate the top left corner of the cell
  const x = module.y * cellWidth;
  const y = (201 - module.x) * cellHeight; // Work backwards from 200 because of the wildmile grid

  // Define points for a right triangle within the cell
  // Assuming the right angle is at the top left corner of the cell
  const points = [
    x,
    y, // Point 1: Top left corner
    x + cellWidth,
    y, // Point 2: Top right corner
    x,
    y + cellHeight, // Point 3: Bottom left corner
  ];

  return (
    <Line
      points={points}
      closed={true} // Close the path to form a shape
      fill={findColor(module.model)} // Fill color
      stroke="#5ECCA2" // Stroke color
      strokeWidth={1} // Stroke width
    />
  );
};

// Choose correct module color
// Draw correct module
const Module = ({ module, cellWidth, cellHeight }) => {
  const color = module.model === "5-d" ? "#D68D5E" : "#189968";
  if (module.shape === "R3" || module.shape === "R2.3") {
    console.log("Module:", module);
    return (
      <Rect
        x={module.y * cellWidth} // Use cellWidth for the x position, work backwards from 200 because of the wildmile grid
        y={(201 - module.x) * cellHeight} // Use cellHeight for the y position
        width={cellWidth} // Set the width of the rectangle to cellWidth
        height={cellHeight} // Set the height of the rectangle to cellHeight
        fill={color}
        stroke="#5ECCA2"
        strokeWidth={1}
      />
    );
  }
  if (module.shape === "T3" || module.shape === "T2.3") {
    // Calculate the top left corner of the cell
    const x = module.y * cellWidth;
    const y = (201 - module.x) * cellHeight; // Work backwards from 200 because of the wildmile grid

    // Define points for a right triangle within the cell
    // Assuming the right angle is at the top left corner of the cell
    const points = [
      x,
      y, // Point 1: Top left corner
      x + cellWidth,
      y, // Point 2: Top right corner
      x,
      y + cellHeight, // Point 3: Bottom left corner
    ];

    return (
      <Line
        points={points}
        closed={true} // Close the path to form a shape
        fill={color} // Fill color
        stroke="#5ECCA2" // Stroke color
        strokeWidth={1} // Stroke width
      />
    );
  }
};

const ModuleGrid = ({ modules, width: cols, height: rows }) => {
  const [scale, setScale] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }
  // Calculate cell size based on the number of columns and rows
  const cellWidth = window.innerWidth / cols;
  const cellHeight = cellWidth;
  console.log(
    "cellWidth:",
    cellWidth,
    "cellHeight:",
    cellHeight,
    "window.innerWidth:",
    window.innerWidth,
    "window.innerHeight:",
    window.innerHeight
  );
  const findColor = (model) => {
    return model === "5-d" ? "#D68D5E" : "#189968";
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={scale}
      scaleY={scale}
      onWheel={handleWheel}
      draggable
    >
      <Layer>
        {modules.map((module, index) => (
          <Group key={index}>
            {/* // Attempt to dynamically render the correct module shape */}
            {/* <Module module={(module, cellWidth, cellHeight)} /> */}
            <Rect
              x={module.y * cellWidth} // Use cellWidth for the x position, work backwards from 200 because of the wildmile grid
              y={(201 - module.x) * cellHeight} // Use cellHeight for the y position
              width={cellWidth} // Set the width of the rectangle to cellWidth
              height={cellHeight} // Set the height of the rectangle to cellHeight
              fill={findColor(module.model)}
              stroke="#5ECCA2"
              strokeWidth={1}
            />
            <Text
              text={`${module.x},${module.y}`}
              x={module.y * cellWidth + 5} // Adjust text position based on cellWidth
              y={module.x * cellHeight + 5} // Adjust text position based on cellHeight
              fontSize={12}
              fill="#000"
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
};

export default ModuleGrid;

// import React, { useState, useEffect } from "react";
// import { Stage, Layer, Rect, Text, Group } from "react-konva";

// const GridLayer = ({ width: cols, height: rows }) => {
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) {
//     console.log("isClient:", isClient);
//     return null;
//   }

//   // Calculate cell size based on the number of columns and rows
//   const cellWidth = 900 / cols;
//   const cellHeight = cellWidth;
//   console.log(
//     "cellWidth:",
//     cellWidth,
//     "cellHeight:",
//     cellHeight,
//     "window.innerWidth:",
//     window.innerWidth,
//     "window.innerHeight:",
//     window.innerHeight
//   );

//   return (
//     <Stage width={window.innerWidth} height={window.innerHeight} draggable>
//       <Layer>
//         {/* Render the grid */}
//         {Array.from({ length: rows }, (_, rowIndex) => (
//           <Group key={rowIndex}>
//             {Array.from({ length: cols }, (_, colIndex) => (
//               <Rect
//                 key={colIndex}
//                 x={colIndex * cellWidth}
//                 y={rowIndex * cellHeight}
//                 width={cellWidth}
//                 height={cellHeight}
//                 fill="#FFFFFF"
//                 stroke="#5ECCA2"
//                 strokeWidth={1}
//               />
//             ))}
//           </Group>
//         ))}
//       </Layer>
//     </Stage>
//   );
// };

// const ModuleLayer = ({ modules, width: cols }) => {
//   const [isClient, setIsClient] = useState(false);
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   if (!isClient) {
//     return null;
//   }

//   const cellWidth = window.innerWidth / cols;
//   const cellHeight = cellWidth;

//   const findColor = (model) => {
//     return model === "5-d" ? "#D68D5E" : "#189968";
//   };

//   const handleWheel = (e) => {
//     e.evt.preventDefault();
//     const scaleBy = 1.02;
//     const stage = e.target.getStage();
//     const oldScale = stage.scaleX();
//     const pointer = stage.getPointerPosition();
//     const mousePointTo = {
//       x: (pointer.x - stage.x()) / oldScale,
//       y: (pointer.y - stage.y()) / oldScale,
//     };
//     const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
//     setScale(newScale);
//     const newPos = {
//       x: pointer.x - mousePointTo.x * newScale,
//       y: pointer.y - mousePointTo.y * newScale,
//     };
//     stage.position(newPos);
//     stage.batchDraw();
//   };

//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight}
//       scaleX={scale}
//       scaleY={scale}
//       onWheel={handleWheel}
//       draggable
//     >
//       <Layer>
//         {/* Render the modules */}
//         {modules.map((module, index) => (
//           <Group key={index}>
//             <Rect
//               x={module.y * cellWidth}
//               y={module.x * cellHeight}
//               width={cellWidth}
//               height={cellHeight}
//               fill={findColor(module.model)}
//               stroke="#5ECCA2"
//               strokeWidth={1}
//             />
//             <Text
//               text={`${module.x},${module.y}`}
//               x={module.y * cellWidth + 5}
//               y={module.x * cellHeight + 5}
//               fontSize={12}
//               fill="#000"
//             />
//           </Group>
//         ))}
//       </Layer>
//     </Stage>
//   );
// };

// export { GridLayer, ModuleLayer };

// import React, { useState } from "react";
// import { Stage, Layer, Rect, Text, Group } from "react-konva";

// const ModuleGrid = ({ modules, width: cols, height: rows }) => {
//   const [scale, setScale] = useState(1);

//   // Calculate cell size based on the number of columns and rows
//   const cellWidth = window.innerWidth / cols;
//   const cellHeight = window.innerHeight / rows;

//   const findColor = (model) => {
//     return model === "5-d" ? "#D68D5E" : "#189968";
//   };

//   const handleWheel = (e) => {
//     e.evt.preventDefault();
//     const scaleBy = 1.02;
//     const stage = e.target.getStage();
//     const oldScale = stage.scaleX();
//     const pointer = stage.getPointerPosition();
//     const mousePointTo = {
//       x: (pointer.x - stage.x()) / oldScale,
//       y: (pointer.y - stage.y()) / oldScale,
//     };
//     const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
//     setScale(newScale);
//     const newPos = {
//       x: pointer.x - mousePointTo.x * newScale,
//       y: pointer.y - mousePointTo.y * newScale,
//     };
//     stage.position(newPos);
//     stage.batchDraw();
//   };

//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight}
//       scaleX={scale}
//       scaleY={scale}
//       onWheel={handleWheel}
//     >
//       <Layer>
//         {modules.map((module, index) => (
//           <Group key={index}>
//             <Rect
//               x={module.y * cellWidth} // Use cellWidth for the x position
//               y={module.x * cellHeight} // Use cellHeight for the y position
//               width={cellWidth} // Set the width of the rectangle to cellWidth
//               height={cellHeight} // Set the height of the rectangle to cellHeight
//               fill={findColor(module.model)}
//               stroke="#5ECCA2"
//               strokeWidth={1}
//             />
//             <Text
//               text={`${module.x},${module.y}`}
//               x={module.y * cellWidth + 5} // Adjust text position based on cellWidth
//               y={module.x * cellHeight + 5} // Adjust text position based on cellHeight
//               fontSize={12}
//               fill="#000"
//             />
//           </Group>
//         ))}
//       </Layer>
//     </Stage>
//   );
// };

// // export default ModuleGrid;

// const ModuleGrider = ({ modules, width: cols }) => {
//   // Example usage within a Mantine Container and Grid
//   return (
//     <Container size="xl" padding="md">
//       <Grid>
//         <Col span={12}>
//           {/* Assuming 'modules' is an array of module objects */}
//           {/* <ModuleGrid modules={modules} width={cols} /> */}
//         </Col>
//       </Grid>
//     </Container>
//   );
// };

// export default ModuleGrider;
// export default ModuleGrid;

// import React, { useState } from "react";
// import { Stage, Layer, Rect, Text, Group } from "react-konva";

// const ModuleGrid = ({ modules, width: cols, height: rows }) => {
//   const [scale, setScale] = useState(1);

//   // Calculate cell width based on the number of columns and the total available width
//   //   const cellWidth = window.innerWidth / cols;
//   //   const cellWidth = "2000px";
//   // Set cell height to be three times the cell width
//   //   const cellHeight = cellWidth * 3;
//   const cellWidth = window.innerWidth / cols;
//   const cellHeight = window.innerHeight / rows;
//   const findColor = (model) => {
//     return model === "5-d" ? "#D68D5E" : "#189968";
//   };

//   const handleWheel = (e) => {
//     e.evt.preventDefault();
//     const scaleBy = 1.02;
//     const stage = e.target.getStage();
//     const oldScale = stage.scaleX();
//     const pointer = stage.getPointerPosition();
//     const mousePointTo = {
//       x: (pointer.x - stage.x()) / oldScale,
//       y: (pointer.y - stage.y()) / oldScale,
//     };
//     const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
//     setScale(newScale);
//     const newPos = {
//       x: pointer.x - mousePointTo.x * newScale,
//       y: pointer.y - mousePointTo.y * newScale,
//     };
//     stage.position(newPos);
//     stage.batchDraw();
//   };

//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight}
//       scaleX={scale}
//       scaleY={scale}
//       onWheel={handleWheel}
//     >
//       <Layer>
//         {modules.map((module, index) => (
//           <Group key={index}>
//             <Rect
//               x={module.y * cellWidth} // Use cellWidth for the x position
//               y={module.x * cellHeight} // Use cellHeight for the y position
//               width={cellWidth} // Set the width of the rectangle to cellWidth
//               height={cellHeight} // Set the height of the rectangle to cellHeight
//               fill={findColor(module.model)}
//               stroke="#5ECCA2"
//               strokeWidth={1}
//             />
//             <Text
//               text={`${module.x},${module.y}`}
//               x={module.y * cellWidth + 5} // Adjust text position based on cellWidth
//               y={module.x * cellHeight + 5} // Adjust text position based on cellHeight
//               fontSize={12}
//               fill="#000"
//             />
//           </Group>
//         ))}
//       </Layer>
//     </Stage>
//   );
// };

// export default ModuleGrid;

// // Grid.js
// import React, { useState } from "react";

// // Helper functions
// const getMod = (data, x, y) => data.find((mod) => mod.x === x && mod.y === y);

// const findColor = (model) => {
//   return model === "5-d" ? "#D68D5E" : "#189968";
// };

// const hashCode = (str) => {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   return hash;
// };

// const pickColor = (str) => {
//   str = str.replace(/ .*/, "");
//   return `hsl(${hashCode(str) % 360}, 80%, 60%)`; // Adjusted to stay within the HSL color wheel
// };

// const GridMap = ({ modules }) => {
//   const [selected, setSelected] = useState(null);

//   const selectItem = (scientificName) => {
//     setSelected(scientificName === selected ? null : scientificName);
//   };

//   return (
//     <svg width="100%" height="100vh" style={{ border: "1px solid black" }}>
//       {/* Render modules */}
//       {modules.map((mod, index) => {
//         const fill = findColor(mod.model);
//         return (
//           <rect
//             key={index}
//             x={mod.y * 20} // Assuming 20 is the width of a column
//             y={mod.x * 60} // Assuming 60 is the height of a row
//             width="20"
//             height="60"
//             fill={fill}
//             stroke="#5ECCA2"
//             strokeWidth="1"
//             onClick={() => selectItem(mod.scientificName)}
//           />
//         );
//       })}
//       {/* Render plants */}
//       {/* {plants.map((plant, index) => {
//         const fill = pickColor(plant.scientificName);
//         return (
//           <rect
//             key={index}
//             x={plant.y * 20 + 15 - plant.x * 5} // Custom position logic
//             y={plant.x * 60 + plant.y * 6} // Custom position logic
//             width="5"
//             height="6"
//             fill={fill}
//             stroke={selected === plant.scientificName ? "red" : "#5ECCA2"}
//             strokeWidth={selected === plant.scientificName ? "2" : "1"}
//             onClick={() => selectItem(plant.scientificName)}
//           />
//         );
//       })} */}
//     </svg>
//   );
// };

// export default GridMap;

// import { useState } from "react";
// import { Group, Rect, Text, Svg } from "@mantine/core";

// const SvgGrid = ({ modules, scale }) => {
//   const [selectedModule, setSelectedModule] = useState(null);

//   return (
//     <Svg width={800} height={600}>
//       {modules.map((module, index) => (
//         <Group
//           key={index}
//           onClick={() => setSelectedModule(module)}
//           transform={`translate(${module.x * scale}, ${module.y * scale})`}
//         >
//           <Rect
//             width={scale}
//             height={scale}
//             fill={module.model === "5-d" ? "#D68D5E" : "#189968"}
//           />
//           <Text x={scale / 2} y={scale / 2} textAnchor="middle" fill="white">
//             {module.model}
//           </Text>
//         </Group>
//       ))}
//     </Svg>
//   );
// };

// export default SvgGrid;

///// v2
// import { useState } from "react";

// const Module = ({ module, onSelect }) => {
//   const color = module.model === "5-d" ? "#D68D5E" : "#189968";
//   return (
//     <div
//       style={{
//         width: "100%", // Ensure the div fills its container
//         height: "100%", // Ensure the div fills its container
//         backgroundColor: color,
//         display: "flex", // Center content within the module
//         justifyContent: "center",
//         alignItems: "center", // Add other styles as needed
//       }}
//       onClick={() => onSelect(module)}
//     >
//       <span>{module.model}</span>
//       <text>{module.x}</text>
//     </div>
//   );
// };

// const ModuleGrid = ({ modules, width, height }) => {
//   // Assuming 'width' and 'height' are the dimensions of the grid in number of cells
//   const [selectedModule, setSelectedModule] = useState(null);

//   const handleSelect = (module) => {
//     setSelectedModule(module);
//     console.log("Selected module:", module);
//     // Additional logic for when a module is selected
//   };

//   // Create a grid matrix to determine which cells are filled
//   let grid = Array.from({ length: height }, () =>
//     Array.from({ length: width }, () => null)
//   );

//   // Fill the grid with module data
//   modules.forEach((module) => {
//     if (grid[module.x] && grid[module.x][module.y]) {
//       grid[module.x][module.y] = module;
//     }
//   });

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: `repeat(${width}, 100px)`, // replace 100px with your desired cell width
//         gridTemplateRows: `repeat(${height}, 100px)`, // replace 100px with your desired cell height
//         gap: "5px", // adjust the gap as needed
//       }}
//     >
//       {grid.map((row, rowIndex) =>
//         row.map((cell, colIndex) => (
//           <div
//             key={`${colIndex}-${rowIndex}`}
//             style={{ border: "1px solid #ccc" }}
//           >
//             {cell ? <Module module={cell} onSelect={handleSelect} /> : null}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default ModuleGrid;

/////// v1

// import { Grid, Card, Text } from "@mantine/core";
// import { useState, useEffect } from "react";

// const Module = ({ module, onSelect }) => {
//   // You might want to use a function or a map to translate model to color
//   const color = module.model === "5-d" ? "#D68D5E" : "#189968";

//   return (
//     <div
//       style={{
//         gridColumnStart: module.x,
//         gridRowStart: module.y,
//         backgroundColor: color,
//         // Add other styles as needed
//       }}
//       onClick={() => onSelect(module)}
//     >
//       {/* Display module content here */}
//       <Text>{module.model}</Text>
//     </div>
//   );
// };

// const ModuleGrid = ({ modules }) => {
//   // Determine the size of the grid based on module coordinates
//   const gridWidth = Math.max(...modules.map((mod) => mod.x)) + 1;
//   const gridHeight = Math.max(...modules.map((mod) => mod.y)) + 1;

//   const [selectedModule, setSelectedModule] = useState(null);
//   console.log("Modules:", gridHeight, gridWidth);
//   // Function to handle module selection
//   const handleSelect = (module) => {
//     setSelectedModule(module);
//     console.log("Selected module:", module);
//     // Additional logic for when a module is selected
//   };

//   return (
//     <Grid
//       style={{
//         display: "grid",
//         gridTemplateColumns: `repeat(${gridHeight}, 1fr)`,
//         gridTemplateRows: `repeat(${gridWidth}, 1fr)`,
//         gap: "5px", // adjust the gap as needed
//       }}
//     >
//       {modules.map((module, index) => (
//         <Module key={index} module={module} onSelect={handleSelect} />
//       ))}
//     </Grid>
//   );
// };

// export default ModuleGrid;

// Usage of ModuleGrid somewhere in your app:
// <ModuleGrid modules={yourModulesArray} />

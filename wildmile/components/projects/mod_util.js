"use client";
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { Grid } from "@mantine/core";
import { Button } from "@mantine/core";
import useSWR from "swr";
import LocationModal from "components/maps/LocationModal";
import { ModuleFormModal } from "./module_form";
import { use } from "passport";
// import dynamic from "next/dynamic";

// const Canvas = dynamic(() => import("../components/canvas"), {
//   ssr: false,
// });
export const fetcher = (url) => fetch(url).then((res) => res.json());

// Choose correct module color
// Draw correct module
const TriangelePointsGen = ({
  orientation,
  flipped,
  cellWidth,
  cellHeight,
  x,
  y,
}) => {
  // Define points for a right triangle within the cell
  // Assuming the right angle is at the top left corner of the cell
  const topLeft = [x, y];
  const topRight = [x + cellWidth, y];
  const bottomLeft = [x, y + cellHeight];
  const bottomRight = [x + cellWidth, y + cellHeight];
  const points = [];
  if (orientation === "RH") {
    if (flipped) {
      points.push(
        topRight[0],
        topRight[1],
        bottomLeft[0],
        bottomLeft[1],
        bottomRight[0],
        bottomRight[1]
      );
    } else {
      points.push(
        topRight[0],
        topRight[1],
        bottomLeft[0],
        bottomLeft[1],
        topLeft[0],
        topLeft[1]
      );
    }
  } else if (orientation === "LH") {
    if (!flipped) {
      points.push(
        topLeft[0],
        topLeft[1],
        bottomRight[0],
        bottomRight[1],
        bottomLeft[0],
        bottomLeft[1]
      );
    } else {
      points.push(
        topLeft[0],
        topLeft[1],
        bottomRight[0],
        bottomRight[1],
        topRight[0],
        topRight[1]
      );
    }
  }
  return points;
};

// Draw a module
export const ModuleGen = ({
  module,
  cellWidth,
  cellHeight,
  setSelectedModule,
}) => {
  // let [selectedModule, setSelectedModule] = useState({});
  function changeModState() {
    setSelectedModule(module);
  }
  const color = module.model === "5-d" ? "#D68D5E" : "#189968";
  if (module.shape === "R3" || module.shape === "R2.3") {
    return (
      <Rect
        x={module.y * cellWidth} // Use cellWidth for the x position, work backwards from 200 because of the wildmile grid
        y={(201 - module.x) * cellHeight} // Use cellHeight for the y position
        width={cellWidth} // Set the width of the rectangle to cellWidth
        height={cellHeight} // Set the height of the rectangle to cellHeight
        fill={color}
        stroke="#5ECCA2"
        strokeWidth={1}
        draggable
        onClick={changeModState}
        id={module._id}
      />
    );
  }
  if (module.shape === "T3" || module.shape === "T2.3") {
    // Calculate the top left corner of the cell
    const x = module.y * cellWidth;
    const y = (201 - module.x) * cellHeight; // Work backwards from 200 because of the wildmile grid
    // Define points for a right triangle within the cell

    const points = TriangelePointsGen({
      orientation: module.orientation,
      flipped: module.flipped,
      cellWidth: cellWidth,
      cellHeight: cellHeight,
      x: x,
      y: y,
    });

    return (
      <Line
        points={points}
        closed={true} // Close the path to form a shape
        fill={color} // Fill color
        stroke="#5ECCA2" // Stroke color
        strokeWidth={1} // Stroke width
        id={module._id}
      />
    );
  }
};

// Generate a cell for a module
export const CellGen = ({ x, y, cellWidth, cellHeight }) => {
  return (
    <Rect
      x={y * cellWidth} // Use cellWidth for the x position, work backwards from 200 because of the wildmile grid
      y={x * cellHeight} // Use cellHeight for the y position
      width={cellWidth} // Set the width of the rectangle to cellWidth
      height={cellHeight} // Set the height of the rectangle to cellHeight
      // fill={color}
      // shadowEnabled={true}
      // shadowColor="black"
      stroke="grey" // Stroke color
      strokeWidth={0.1}
      // dash={[3, 9]} // Make the line dotted
      strokeOpacity={0.2} // Make the line slightly transparent
      onClick={() => console.log("Clicked on module:", module)}
      id={module._id}
    />
  );
};

// const ModuleGrid = ({moduleId}) => {

// export function getMods(section_name) {
//   const { data, error, isLoading } = useSWR(
//     `/projects/api?section_name=${section_name}`,
//     fetcher
//   );

//   if (error) return <div>failed to load</div>;
//   if (isLoading) return <div>loading...</div>;
// return (
//   <div>
//     <Layer>
//       {data.modules.map((module, index) => (
//         <Group key={index}>
//           <ModuleGen
//             module={module}
//             cellWidth={cellWidth}
//             cellHeight={cellHeight}
//           />
//         </Group>
//       ))}
//     </Layer>
//   </div>
// );
// }

// Existing code...

// Call the addLayers function from another function

// export default ModuleGrid;

export async function getMods(section_name) {
  const response = await fetch(`/projects/api/${section_name}`);
  const data = await response.json();

  return data.modules;
}
export default function ModuleGrid({ ...params }) {
  const section_name = params.sectionName;
  const current_modules = params.modules;
  const [modules, setModules] = useState(current_modules);
  const [newModule, setNewModule] = useState({});
  const addModule = (module) => {
    setModules((prevModules) => [...prevModules].concat(module));
  };
  const [layers, setLayers] = useState([]);

  const addLayers = (layers) => {
    // Add the layers to the existing modules state
    setModules((prevModules) => [...prevModules, ...layers]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetcher(`/projects/api/${section_name}`);
      // Transform your data into layers here
      const newLayers = data.map((item) => {
        // Create a layer or any Konva objects based on your item
        return item; // Placeholder, transform item into a Konva Layer or other Konva objects
      });
      setLayers(newLayers);
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  // Fetch modules on component mount or when sectionName changes
  useEffect(() => {
    fetchModules();
  }, [sectionName]);

  const handleFetchModulesClick = () => {
    fetchModules();
  };

  //   if (error) return <div>Failed to load</div>;
  //   if (!data) return <div>Loading...</div>;
  // render data
  // return <div>Hello {data.name}!</div>

  /// failed attempt to do client side fetch
  // TODO: implement wss
  //   console.log("sectionName:", sectionName);
  //   useEffect(() => {
  //     const fetchModules = () => {
  //       const res = fetch(`/projects/api`, { params: sectionName });
  //       //   const data = res.JSON({ section: sectionName });
  //       console.log("res:", res);
  //       setModules(res);
  //     };
  //     fetchModules();
  //   }, []);
  // return (
  //     <ModuleGrid
  //     cols={20}
  //     rows={200}
  //     modules={modules}
  //     addModule={addModule}
  //     newModule={newModule}
  //     />
  // );
  // }
  console.log("section_name:", modules);
  // { width: cols, height: rows }
  const gridRef = useRef(null);
  const stageRef = useRef();
  const [stageHeight, setStageHeight] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  const [cols, setCols] = useState(20);
  const [rows, setRows] = useState(200);

  //   useEffect(() => {
  //     if (gridRef.current) {
  //       setStageHeight(gridRef.current.offsetHeight);
  //     }
  //   }, []);
  useEffect(() => {
    if (gridRef.current) {
      setContainerSize({
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerSize({
          width: gridRef.current.offsetWidth,
          height: gridRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [scale, setScale] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }

  const cellWidth = window.innerWidth / cols / 2;
  const cellHeight = cellWidth * 3;
  const pivotX = window.innerWidth / 2;
  const pivotY = window.innerHeight / 2;
  const handleButtonClick = (e) => {
    setRotation((prevRotation) => (prevRotation === 0 ? 270 : 0));

    // const stage = stageRef.current;

    // console.log("grefcr:", gridRef.current);
    // const oldRotation = stage.rotation();
    // const radians = oldRotation * (Math.PI / 180);
    // const cos = Math.cos(radians);
    // const sin = Math.sin(radians);
    // const dx = pivotX - (pivotX * cos - pivotY * sin);
    // const dy = pivotY - (pivotX * sin + pivotY * cos);
    // stage.position({ x: dx, y: dy });
  };
  //   const redraw = () => {
  //     stageRef.draw();
  //   };

  //   console.log("stageHeight:", gridRef.current.offsetWidth);
  console.log("stageHeight:", stageHeight);
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
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
  // Calculate cell size based on the number of columns and rows

  return (
    <div ref={gridRef}>
      <Button onClick={handleButtonClick}>Rotate</Button>
      <Button onClick={() => addModule()}>add module</Button>
      <Button onClick={() => console.log("modules:", modules)} />
      <Button onClick={() => redraw()}>Redraw</Button>
      <button onClick={handleFetchModulesClick}>Fetch Modules</button>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
        rotation={rotation}
        draggable
      >
        <Layer>
          {Array.from({ length: rows }, (_, i) => (
            <Group key={i}>
              {Array.from({ length: cols }, (_, j) => (
                <CellGen
                  key={`${i}-${j}`}
                  x={i}
                  y={j}
                  cellWidth={cellWidth}
                  cellHeight={cellHeight}
                />
              ))}
            </Group>
          ))}
        </Layer>
        <Layer>
          {modules.map((module, index) => (
            <Group key={index}>
              <ModuleGen
                module={module}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

// export default ModuleGrid;

// <Group key={index}>
//   {/* // Attempt to dynamically render the correct module shape */}

//   <Text
//     text={`${module.x},${module.y}`}
//     x={module.y * cellWidth + 5} // Adjust text position based on cellWidth
//     y={(201 - module.x) * cellHeight + 5} // Adjust text position based on cellHeight
//     fontSize={12}
//     fill="#000"
//   />
// </Group>

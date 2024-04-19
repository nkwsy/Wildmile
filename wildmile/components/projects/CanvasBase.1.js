export const CanvasBase = ({ children, width, height }) => {
  console.log("CanvasBase", width, height);
  const {
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
    cells,
    setCells,
    mode,
    setMode,
    editMode,
    setEditMode,
    isCellSelected,
    clearSelectedCells,
    triggerUpdate,
    handleSomeUpdate,
    gridRef,
    plantRef,
    modRef,
    newModules,
    setNewModules,
    removedModules,
    setRemovedModules,
    setPlants,
    plants,
    setIndividualPlants,
    individualPlants,
    togglePlantCellSelection,
    selectedPlantCell,
    setSelectedPlantCell,
    clearSelectedPlantCells,
    isPlantCellSelected,
    returnSelectedPlantCells,
  } = useContext(CanvasContext);

  const [rotation, setRotation] = useState(0);
  const [modules, setModules] = useState([]);
  const [triggerUpdateMod, setTriggerUpdateMod] = useState(false);

  const [scale, setScale] = useState(1);
  const [cols, setCols] = useState(width); // Set initial value of cols to width
  const [rows, setRows] = useState(height); // Set initial value of rows to height

  useEffect(() => {
    setTriggerUpdateMod((prev) => !prev);
  }, [modules]);

  // handle updating the new modules
  useEffect(() => {
    console.log("New Modules:", newModules, modules);
    setModules((prevModules) => [...prevModules, ...newModules]);
    setSelectedCell(new Map());

    // setNewModules([]);
  }, [newModules]);

  // handle updating the removed modules
  useEffect(() => {
    console.log("Removed Modules:", removedModules, modules);
    setModules((prevModules) =>
      prevModules.filter(
        (module) =>
          !removedModules.some(
            (removedModule) => removedModule._id === module._id
          )
      )
    );

    // Optionally, clear the removedModules if needed
    setSelectedCell(new Map());
  }, [removedModules]);

  // Function to redraw layer by name
  const redrawLayerByName = () => {
    if (!gridRef.current || !modRef.current) {
      console.warn("Stage or mofref is not yet available");
      return;
    }
    const stage = gridRef.current.getStage(); // Get the Konva Stage instance
    const layer = modRef.current.getLayer(); // Get the Konva Layer instance
    console.log("redraw Layer:", layer);
    // layer.draw();
    // gridRef.current.batchDraw();
  };

  // selectedModule useEffect
  useEffect(() => {
    console.log("Selected Module:", selectedModule);
    if (selectedModule._id) {
      console.log("Selected open:", selectedModule);
      //   ModuleFormModal(selectedModule);
      setIsFormOpen(true);
    }
  }, [selectedModule]);
  useEffect(() => {
    console.log("Selected Cell:", selectedCell);
    if (selectedModule._id) {
      console.log("Selected Cell open:", selectedCell);
      //   ModuleFormModal(selectedModule);
      setIsFormOpen(true);
    }
  }, [selectedModule]);

  // useEffect to log updated modules
  useEffect(() => {
    console.log("Updated Modules:", modules);
  }, [modules]);

  // Set the container size, unknown if used
  const [containerSize, setContainerSize] = useState({
    width:
      typeof window !== "undefined" && window.innerWidth
        ? window.innerWidth
        : 1200,
    height:
      typeof window !== "undefined" && window.innerHeight
        ? window.innerHeight
        : 1200,
  });

  useEffect(() => {
    setCols(width);
  }, [width]);
  useEffect(() => {
    setRows(height);
  }, [height]);

  // Zoom functions
  const [zoomLevel, setZoomLevel] = useState(1);
  // const [rows, height] = useStore();
  const stageRef = useRef();
  useEffect(() => {
    if (gridRef.current) {
      setContainerSize({
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight,
      });
      console.log("Container Size:", containerSize);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerSize({
          width: gridRef.current.offsetWidth,
          height: gridRef.current.offsetHeight,
        });
        console.log("Container Size:", containerSize);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Rotate button function
  const rotateButton = (e) => {
    setRotation((prevRotation) => (prevRotation === 0 ? 270 : 0));
  };

  // Make sure user is client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  //   const [cellWidth, setCellWidth] = useState(
  // typeof window !== "undefined" ? window.innerWidth / cols / 2 : 20
  //   );
  const [cellWidth, setCellWidth] = useState(20);
  const [cellHeight, setCellHeight] = useState(cellWidth * 3);

  // Function to handle zooming
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.2;
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
  };

  useEffect(() => {
    // Update the state to store the window size
    const handleResize = () => {
      setCellWidth(useWindow() / cols / 2);
      setCellHeight(cellWidth * 3);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cols, cellWidth]); // Update when cols or cellWidth changes

  // Create default context for context provider
  const [isFormOpen, setIsFormOpen] = useState(false);

  const value = {
    plantRef,
    modRef,
    modules,
    setModules,
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
    clearSelectedCells,
    mode,
    setMode,
    editMode,
    setEditMode,
    isCellSelected,
    triggerUpdate,
    handleSomeUpdate,

    setIsFormOpen,
    cells,
    setCells,
    triggerUpdate,
    handleSomeUpdate,
    setPlants,
    plants,
    setIndividualPlants,
    individualPlants,
    togglePlantCellSelection,
    selectedPlantCell,
    setSelectedPlantCell,
    clearSelectedPlantCells,
    isPlantCellSelected,
    returnSelectedPlantCells,
  };
  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }
  return (
    <>
      <CanvasContext.Provider value={value}>
        <div>
          <UpdateModules triggerUpdate={triggerUpdate} />
          {/* <button onClick={handleSomeUpdate}>Update Modules</button> */}
          <Stage
            ref={gridRef}
            width={containerSize.width}
            height={containerSize.height}
            scaleX={scale}
            scaleY={scale}
            onWheel={handleWheel}
            rotation={rotation}
            draggable
          >
            <CreateRectLayer triggerUpdate={triggerUpdateMod} />
            <Layer ref={plantRef}></Layer>
            <Layer ref={modRef}></Layer>
            {children}
          </Stage>
        </div>
      </CanvasContext.Provider>
    </>
  );
};

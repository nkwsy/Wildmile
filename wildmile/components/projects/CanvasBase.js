export const CanvasBase = ({ children, width, height }) => {
  console.log("CanvasBase", width, height);
  const {
    modules,
    setModules,
    triggerUpdateMod,
    setTriggerUpdateMod,

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
  //   const [cols, setCols] = useState(width); // Set initial value of cols to width
  //   const [rows, setRows] = useState(height); // Set initial value of rows to height
  //   const [modules, setModules] = useState([]);
  //   const [triggerUpdateMod, setTriggerUpdateMod] = useState(false);
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

  // Create default context for context provider
  const [isFormOpen, setIsFormOpen] = useState(false);

  const value = {
    modules,
    setModules,

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

  return (
    <>
      <CanvasContext.Provider value={value}>
        <div>
          <UpdateModules triggerUpdate={triggerUpdate} />

          <CreateRectLayer triggerUpdate={triggerUpdateMod} />

          {children}
        </div>
      </CanvasContext.Provider>
    </>
  );
};

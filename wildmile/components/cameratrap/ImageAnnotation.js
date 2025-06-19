"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardSection,
  Image,
  Text,
  Button,
  NumberInput,
  Group,
  Stack,
  Badge,
  Checkbox,
  TextInput,
  ActionIcon,
  Modal,
  Grid,
  GridCol,
  Indicator,
  Flex,
  Tooltip,
} from "@mantine/core";
import {
  IconHeartPlus,
  IconHeart,
  IconHeartFilled,
  IconSend,
  IconMaximize,
  IconLink,
  IconX,
  IconPhotoSearch,
  IconZoomQuestion,
  IconMoodWrrr,
  IconPencil, // For drawing button
  IconTrash, // For clearing boxes
} from "@tabler/icons-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { v4 as uuidv4 } from "uuid"; // For unique box IDs
import { useImage, useSelection } from "./ContextCamera";
import checkboxClasses from "styles/checkbox.module.css";
import styles from "styles/animalSelection.module.css";
import { ObservationHistoryPopover } from "./ObservationHistory";
import { SpeciesConsensusBadges } from "./SpeciesConsensusBadges";

export function ImageAnnotation({ fetchNextImage }) {
  const [currentImage, setCurrentImage] = useImage();
  const [selection, setSelection] = useSelection();
  const [animalCounts, setAnimalCounts] = useState({});
  const [noAnimalsVisible, setNoAnimalsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(false);
  const [humanPresent, setHumanPresent] = useState(false);
  const [vehiclePresent, setVehiclePresent] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // New state for multi-box, species-specific drawing
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeSpeciesForDrawing, setActiveSpeciesForDrawing] = useState(null); // { id, name, color }
  const [drawnBoxes, setDrawnBoxes] = useState([]); // Array of { id: uuid, speciesId, speciesName, coordinates: {x,y,w,h}, normalizedCoordinates: {bboxX,...}, color }
  const [tempDrawingBox, setTempDrawingBox] = useState(null); // {startX, startY, currentX, currentY, color} for current drag
  // Load initial values from localStorage
  const [nextColorIndex, setNextColorIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedIndex = localStorage.getItem('nextColorIndex');
        return storedIndex ? parseInt(storedIndex, 10) : 0;
      } catch (e) {
        console.error('Failed to parse nextColorIndex from localStorage', e);
        return 0;
      }
    }
    return 0;
  });
  const [speciesColors, setSpeciesColors] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedColors = localStorage.getItem('speciesColors');
        return storedColors ? JSON.parse(storedColors) : {};
      } catch (e) {
        console.error('Failed to parse speciesColors from localStorage', e);
        return {};
      }
    }
    return {};
  });

  const BOX_COLORS = ['#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231'];

  // speciesColors and nextColorIndex are now primarily managed by the useEffect hook watching 'selection'.
  // This function can act as a simple getter or a fallback if needed, but should avoid setting state if called during render.
  const getSpeciesColor = (speciesId, fallbackColor = '#CCCCCC') => {
    return speciesColors[speciesId] || fallbackColor;
  };

  const redrawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Ensure canvas is the same size as the displayed image
    canvas.width = imageRef.current.offsetWidth;
    canvas.height = imageRef.current.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all committed boxes
    drawnBoxes.forEach((box) => {
      ctx.strokeStyle = box.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        box.coordinates.x,
        box.coordinates.y,
        box.coordinates.width,
        box.coordinates.height
      );
      // Optionally, draw species name next to box
      ctx.fillStyle = box.color;
      ctx.font = "12px Arial";
      ctx.fillText(box.speciesName, box.coordinates.x, box.coordinates.y - 5);
    });

    // Draw the box currently being drawn (if any)
    if (tempDrawingBox) {
      ctx.strokeStyle = tempDrawingBox.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        tempDrawingBox.startX,
        tempDrawingBox.startY,
        tempDrawingBox.currentX - tempDrawingBox.startX,
        tempDrawingBox.currentY - tempDrawingBox.startY
      );
    }
  };

  useEffect(redrawCanvas, [drawnBoxes, tempDrawingBox]); // Redraw when boxes change or temp box changes

  // Effect to initialize animal counts and assign colors when selection changes
  useEffect(() => {
    if (selection && selection.length > 0) {
      let newCounts = { ...animalCounts };
      let newColors = { ...speciesColors };
      let localNextColorIndex = nextColorIndex; // Use a local copy for batch assignment
      let countsChanged = false;
      let colorsAssigned = false;

      selection.forEach(animal => {
        // Initialize count if not present
        if (!(animal.id in newCounts)) {
          newCounts[animal.id] = 1; // Default count to 1
          countsChanged = true;
        }
        // Assign color if not present
        if (!(animal.id in newColors)) {
          newColors[animal.id] = BOX_COLORS[localNextColorIndex % BOX_COLORS.length];
          localNextColorIndex++;
          colorsAssigned = true;
        }
      });

      if (countsChanged) {
        setAnimalCounts(newCounts);
      }
      if (colorsAssigned) {
        setSpeciesColors(newColors);
        setNextColorIndex(localNextColorIndex); // Update the main index after batch assignment
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('speciesColors', JSON.stringify(newColors));
            localStorage.setItem('nextColorIndex', localNextColorIndex.toString());
          } catch (e) {
            console.error('Failed to save to localStorage', e);
          }
        }
      }
    }
    // Clean up colors for species no longer in selection (optional, but good practice)
    // This part also needs to update localStorage if changes are made.
    const selectionIds = new Set(selection.map(s => s.id));
    const currentSpeciesWithColors = Object.keys(speciesColors);
    let colorsToClean = false;
    let cleanedColors = { ...speciesColors };
    currentSpeciesWithColors.forEach(id => {
      if (!selectionIds.has(id) && !selectionIds.has(Number(id))) { // Check for both string and number IDs due to object key nature
        delete cleanedColors[id];
        colorsToClean = true;
      }
    });
    if (colorsToClean) {
      setSpeciesColors(cleanedColors);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('speciesColors', JSON.stringify(cleanedColors));
          // nextColorIndex doesn't change here, so no need to update it in localStorage
        } catch (e) {
          console.error('Failed to save cleaned colors to localStorage', e);
        }
      }
    }

  }, [selection, animalCounts, speciesColors, nextColorIndex, BOX_COLORS]); // Added dependencies that were implicitly used or should be explicit

  // Effect to recalculate box coordinates on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!imageRef.current) return;

      const newImageWidth = imageRef.current.offsetWidth;
      const newImageHeight = imageRef.current.offsetHeight;

      setDrawnBoxes(currentBoxes =>
        currentBoxes.map(box => {
          if (!box.normalizedCoordinates) return box; // Should not happen for committed boxes

          const newCanvasX = box.normalizedCoordinates.bboxX * newImageWidth;
          const newCanvasY = box.normalizedCoordinates.bboxY * newImageHeight;
          const newCanvasWidth = box.normalizedCoordinates.bboxWidth * newImageWidth;
          const newCanvasHeight = box.normalizedCoordinates.bboxHeight * newImageHeight;

          return {
            ...box,
            coordinates: {
              x: newCanvasX,
              y: newCanvasY,
              width: newCanvasWidth,
              height: newCanvasHeight,
            },
          };
        })
      );
      // redrawCanvas will be triggered by the useEffect watching drawnBoxes
    };

    window.addEventListener('resize', handleResize);
    // Call it once initially in case the image loaded before this effect ran or dimensions changed
    // handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [imageRef]); // Rerun if imageRef itself changes, though it's a ref, its .current changes are what matter.

  useEffect(() => {
    if (currentImage) {
      setComments(currentImage.mediaComments || []);
      setIsFavorite(currentImage.favorite || false);
      setNeedsReview(currentImage.needsReview || false);
      setFlagged(currentImage.flagged || false);

      // Reset drawing states for new image
      setDrawnBoxes([]);
      setActiveSpeciesForDrawing(null);
      setIsDrawingMode(false);
      setTempDrawingBox(null);
      // speciesColors and nextColorIndex are now persisted, so don't reset them here
      // setNextColorIndex(0);
      // setSpeciesColors({});
      redrawCanvas(); // Clear canvas for new image
    }
  }, [currentImage]);

  const handleActivateDrawingMode = (species) => {
    // animalCounts should be populated by the useEffect hook by now
    const speciesCount = animalCounts[species.id];
    const boxesForSpecies = drawnBoxes.filter(b => b.speciesId === species.id).length;

    if (speciesCount === undefined) {
      // This should ideally not happen if the useEffect for selection works correctly
      console.warn(`Count for species ${species.id} is undefined. Defaulting to 1 for drawing activation.`);
      // animalCounts[species.id] = 1; // Or update state, but that's async
    }

    const currentSpeciesColor = speciesColors[species.id];
    if (!currentSpeciesColor) {
      // This should ideally not happen if useEffect[selection] populates colors correctly.
      // As a fallback, assign a color now, though this involves a state update.
      // This could happen if a species is added and drawing mode activated in the same render cycle
      // before the useEffect for selection has a chance to run and assign the color.
      // To make it more robust, we might need a more immediate way to assign color or ensure useEffect runs first.
      console.warn(`Color for species ${species.id} not found in speciesColors. Assigning a new one.`);
      // For now, let's rely on useEffect[selection] to have pre-assigned.
      // If it's critical to get a color *now* even if useEffect hasn't run, we'd need a more complex synchronous update
      // or a different pattern. The current getSpeciesColor modified earlier might be called here if absolutely needed,
      // but let's assume speciesColors[species.id] is populated.
      // If a color is missing here, it implies an issue with the useEffect hook not populating it,
      // or an unexpected state. Alerting and returning is safer than assigning a temporary color
      // that isn't reflected in the main speciesColors state or localStorage.
       alert("Color not pre-assigned for species. Please try again or check console. This may indicate an issue with color assignment.");
       return;
    }

    if (boxesForSpecies >= (speciesCount || 1)) { // Use speciesCount directly, fallback to 1 if somehow still undefined
      alert(`You have already drawn ${boxesForSpecies} boxes for ${species.preferred_common_name || species.name}, which is the selected count (${speciesCount || 1}). Increase the count to add more boxes.`);
      return;
    }

    setActiveSpeciesForDrawing({ ...species, color: currentSpeciesColor });
    setIsDrawingMode(true);
    // Consider changing cursor style here, e.g., canvasRef.current.style.cursor = 'crosshair';
  };

  const handleCanvasMouseDown = (event) => {
    if (!isDrawingMode || !activeSpeciesForDrawing || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect(); // Use imageRef for coordinates
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTempDrawingBox({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      color: activeSpeciesForDrawing.color,
    });
  };

  const handleCanvasMouseMove = (event) => {
    if (!isDrawingMode || !tempDrawingBox || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    setTempDrawingBox((prev) => ({ ...prev, currentX, currentY }));
    // Redraw will be handled by useEffect watching tempDrawingBox
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawingMode || !tempDrawingBox || !activeSpeciesForDrawing || !imageRef.current) {
      if (tempDrawingBox) setTempDrawingBox(null); // Clear temp box if mouse up outside relevant state
      return;
    }

    const imageElement = imageRef.current;
    const displayWidth = imageElement.offsetWidth;
    const displayHeight = imageElement.offsetHeight;
    // const naturalWidth = imageElement.naturalWidth; // Use for normalization if available & needed
    // const naturalHeight = imageElement.naturalHeight;

    const finalStartX = Math.min(tempDrawingBox.startX, tempDrawingBox.currentX);
    const finalStartY = Math.min(tempDrawingBox.startY, tempDrawingBox.currentY);
    const finalEndX = Math.max(tempDrawingBox.startX, tempDrawingBox.currentX);
    const finalEndY = Math.max(tempDrawingBox.startY, tempDrawingBox.currentY);

    const boxWidth = finalEndX - finalStartX;
    const boxHeight = finalEndY - finalStartY;

    if (boxWidth < 5 || boxHeight < 5) { // Ignore tiny boxes
      setTempDrawingBox(null);
      // setIsDrawingMode(false); // Optional: deactivate drawing mode
      // setActiveSpeciesForDrawing(null);
      return;
    }

    // animalCounts should be populated by the useEffect hook
    const speciesCount = animalCounts[activeSpeciesForDrawing.id];
    const boxesForSpecies = drawnBoxes.filter(b => b.speciesId === activeSpeciesForDrawing.id).length;

    if (speciesCount === undefined) {
       console.warn(`Count for active drawing species ${activeSpeciesForDrawing.id} is undefined. Defaulting to 1 for box limit check.`);
    }

    if (boxesForSpecies >= (speciesCount || 1)) { // Use speciesCount directly, fallback to 1 if somehow still undefined
      alert(`Cannot add more boxes for ${activeSpeciesForDrawing.preferred_common_name || activeSpeciesForDrawing.name}. Limit is ${speciesCount || 1}.`);
      setTempDrawingBox(null);
      setIsDrawingMode(false);
      setActiveSpeciesForDrawing(null);
      return;
    }


    const newBox = {
      id: uuidv4(),
      speciesId: activeSpeciesForDrawing.id,
      speciesName: activeSpeciesForDrawing.preferred_common_name || activeSpeciesForDrawing.name,
      coordinates: {
        x: finalStartX,
        y: finalStartY,
        width: boxWidth,
        height: boxHeight,
      },
      normalizedCoordinates: {
        bboxX: finalStartX / displayWidth,
        bboxY: finalStartY / displayHeight,
        bboxWidth: boxWidth / displayWidth,
        bboxHeight: boxHeight / displayHeight,
      },
      color: activeSpeciesForDrawing.color,
    };

    setDrawnBoxes((prev) => [...prev, newBox]);
    setTempDrawingBox(null);
    // Deactivate drawing mode for this species, require clicking "Draw Box" again
    setIsDrawingMode(false);
    setActiveSpeciesForDrawing(null);
     // canvasRef.current.style.cursor = 'default';
  };

  const clearAllDrawnBoxes = () => {
    setDrawnBoxes([]);
    // redrawCanvas will be called by useEffect
  };

  const clearBoxesForSpecies = (speciesId) => {
    setDrawnBoxes(prev => prev.filter(box => box.speciesId !== speciesId));
    // redrawCanvas will be called by useEffect
  };


  const handleCountChange = (id, value) => {
    setAnimalCounts((prev) => ({ ...prev, [id]: value }));
    // If count is reduced below number of boxes, remove excess boxes
    const currentBoxCount = drawnBoxes.filter(box => box.speciesId === id).length;
    if (value < currentBoxCount) {
        const boxesToKeep = drawnBoxes.filter(box => box.speciesId === id).slice(0, value);
        const otherBoxes = drawnBoxes.filter(box => box.speciesId !== id);
        setDrawnBoxes([...otherBoxes, ...boxesToKeep]);
    }
  };

  const handleNoAnimalsClick = async () => {
    await handleSaveObservations({ forceNoAnimals: true });
  };

  const handleSaveObservations = async ({ forceNoAnimals = false } = {}) => {
    if (!currentImage) return;

    setIsSaving(true);
    if (comment.trim()) {
      await handleAddComment();
    }

    let observations = [];

    if (
      (forceNoAnimals || noAnimalsVisible) &&
      !humanPresent &&
      !vehiclePresent
    ) {
      observations.push({
        mediaId: currentImage.mediaID,
        mediaInfo: {
          md5: currentImage.mediaID,
          imageHash: currentImage.imageHash,
        },
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: "media",
        observationType: "blank",
      });
    } else {
      if (selection.length > 0) {
        observations = selection.map((animal) => {
          const speciesSpecificBoxes = drawnBoxes
            .filter((box) => Number(box.speciesId) === Number(animal.id)) // Ensure numeric comparison
            .map((box) => box.normalizedCoordinates);

          const obs = {
            mediaId: currentImage.mediaID,
            mediaInfo: {
              md5: currentImage.mediaID,
              imageHash: currentImage.imageHash,
            },
            taxonId: animal.id,
            scientificName: animal.name,
            commonName: animal.preferred_common_name || animal.name,
            count: animalCounts[animal.id] || 1,
            eventStart: currentImage.timestamp,
            eventEnd: currentImage.timestamp,
            observationLevel: "media",
            observationType: "animal",
          };
          if (speciesSpecificBoxes.length > 0) {
            obs.boundingBoxes = speciesSpecificBoxes;
          }
          return obs;
        });
      }

      if (humanPresent) {
        observations.push({
          mediaId: currentImage.mediaID,
          mediaInfo: {
            md5: currentImage.mediaID,
            imageHash: currentImage.imageHash,
          },
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "human",
        });
      }

      if (vehiclePresent) {
        observations.push({
          mediaId: currentImage.mediaID,
          mediaInfo: {
            md5: currentImage.mediaID,
            imageHash: currentImage.imageHash,
          },
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "vehicle",
        });
      }
    }

    try {
      const response = await fetch("/api/cameratrap/saveObservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(observations),
      });

      fetchNextImage();
      if (response.ok) {
        // Instead of fetchRandomImage, use fetchNextImage
        // await fetchNextImage();
        // setSelection([]);
        // setAnimalCounts({});
        setNoAnimalsVisible(false);
      } else {
        alert("Failed to save observations. Make sure you're logged in");
      }
    } catch (error) {
      console.error("Error saving observations:", error);
      alert("Error saving observations");
    } finally {
      setIsSaving(false);
    }
    // Reset drawing states after saving
    setDrawnBoxes([]);
    setActiveSpeciesForDrawing(null);
    setIsDrawingMode(false);
    setTempDrawingBox(null);
    // speciesColors and nextColorIndex are now persisted, so don't reset them here
    // setNextColorIndex(0);
    // setSpeciesColors({});
    redrawCanvas();
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch("/api/cameratrap/addComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID, comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setComment("");
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleFavorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        alert("Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error toggling favorite");
    }
  };

  const handleNeedsReview = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleNeedsReview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID }),
      });

      if (response.ok) {
        const data = await response.json();
        setNeedsReview(data.needsReview);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to toggle needs review");
      }
    } catch (error) {
      console.error("Error toggling needs review:", error);
      alert("Error toggling needs review");
    }
  };

  const handleFlagged = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleFlagged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID }),
      });

      if (response.ok) {
        const data = await response.json();
        setFlagged(data.flagged);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to toggle flagged status");
      }
    } catch (error) {
      console.error("Error toggling flagged status:", error);
      alert("Error toggling flagged status");
    }
  };

  const toggleEnlargedImage = () => {
    setEnlargedImage(!enlargedImage);
  };

  const handleRemoveAnimal = (animalId) => {
    setSelection((prev) => prev.filter((animal) => animal.id !== animalId));
    setAnimalCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[animalId];
      return newCounts;
    });
    // Also remove any drawn boxes for this species
    clearBoxesForSpecies(animalId);
  };

  if (!currentImage) {
    return <Text>No image selected</Text>;
  }
  console.log(currentImage);
  return (
    <>
      <Card shadow="sm" radius="md" withBorder style={{ height: "100%" }}>
        <div style={{ position: "relative" }}>
          <TransformWrapper
            defaultScale={1}
            wheel={{ step: 0.4 }} // how fast you zoom with the mouse wheel
            pinch={{ step: 0.2 }} // how fast you zoom with pinch gesture
            // doubleClick={{ disabled: true }} // optional: disable double-click zoom
            disabled={isDrawingMode} // Disable pan/zoom when drawing
          >
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "auto", // Adjust as per your layout needs
                position: "relative", // Needed for canvas overlay
              }}
            >
              <Image
                ref={imageRef}
                src={currentImage.publicURL}
                fit="contain"
                width="100%"
                alt="Wildlife image"
                onLoad={() => {
                  // Ensure canvas is same size as displayed image
                  if (canvasRef.current && imageRef.current) {
                    canvasRef.current.width = imageRef.current.width;
                    canvasRef.current.height = imageRef.current.height;
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp} // Stop drawing if mouse leaves canvas, or just clear temp box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  cursor: "crosshair",
                  zIndex: 10, // Ensure canvas is on top
                }}
              />
            </TransformComponent>
          </TransformWrapper>
          <ActionIcon
            style={{ position: "absolute", top: 10, right: 10 }}
            onClick={toggleEnlargedImage}
          >
            <IconMaximize size={24} />
          </ActionIcon>
        </div>
        <Grid>
          {/* <Group grow wrap="nowrap"> */}
          <Text mt="xs" size="xs" style={{ fontFamily: "monospace" }}>
            Image Timestamp:{" "}
            {new Date(currentImage.timestamp).toLocaleString("en-US", {
              timeZone: "UTC",
            })}
          </Text>
          <Text mt="xs" size="xs" style={{ fontFamily: "monospace" }}>
            Media ID: {currentImage.mediaID}
          </Text>
          {/* </Group> */}
          {drawnBoxes.length > 0 && (
            <Button
              onClick={clearAllDrawnBoxes}
              color="red"
              variant="outline"
              mt="xs"
              size="xs"
              leftIcon={<IconTrash size={14} />}
            >
              Clear All Drawn Boxes
            </Button>
          )}
          <GridCol span={{ base: 12, md: 12, lg: 6 }}>
            <Group position="apart" mt="md">
              <ActionIcon
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/cameratrap/identify/${currentImage.mediaID}`
                  );
                  alert("Image URL copied to clipboard");
                }}
              >
                <IconLink />
              </ActionIcon>
              <Tooltip label="Need Help with ID">
                <ActionIcon
                  onClick={handleNeedsReview}
                  variant={needsReview ? "filled" : "outline"}
                  color="yellow"
                >
                  <IconPhotoSearch />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Report Inappropriate">
                <ActionIcon
                  onClick={handleFlagged}
                  variant={flagged ? "filled" : "outline"}
                  color="red"
                >
                  <IconMoodWrrr />
                </ActionIcon>
              </Tooltip>
              <Indicator
                inline
                label={currentImage.favoriteCount}
                disabled={!currentImage.favoriteCount}
                size={16}
              >
                <ActionIcon
                  onClick={handleToggleFavorite}
                  color={isFavorite ? "red" : "red"}
                  variant={isFavorite ? "filled" : "outline"}
                >
                  {isFavorite ? (
                    <IconHeart size={24} />
                  ) : (
                    <IconHeartPlus size={24} />
                  )}
                </ActionIcon>
              </Indicator>
            </Group>
            <Group mt="xs">
              <TextInput
                placeholder="Add a comment..."
                value={comment}
                onChange={(event) => setComment(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <ActionIcon onClick={handleAddComment} disabled={!comment.trim()}>
                <IconSend size={24} />
              </ActionIcon>
            </Group>
            <Stack spacing="xs" mt="md">
              {comments.map((comment, index) => (
                <Text key={index} size="sm">
                  <strong>{comment.author.name}:</strong> {comment.text}
                </Text>
              ))}
            </Stack>
          </GridCol>
          <GridCol span={{ base: 12, md: 12, lg: 6 }}>
            {!noAnimalsVisible && (
              <Flex direction="column" gap="xs" mt="md">
                {selection.map((animal) => {
                  const animalColor = speciesColors[animal.id] || '#CCCCCC'; // Get pre-assigned color, fallback
                  const boxesForThisSpecies = drawnBoxes.filter(b => b.speciesId === animal.id).length;
                  const countForThisSpecies = animalCounts[animal.id] || 1;
                  return (
                    <div key={animal.id} className={styles.selectionContainer}>
                      <div className={styles.selectionContent}>
                        <Text className={styles.speciesName} style={{ color: activeSpeciesForDrawing?.id === animal.id ? animalColor : 'inherit' }}>
                          {animal.preferred_common_name || animal.name} ({boxesForThisSpecies}/{countForThisSpecies})
                        </Text>
                        <div className={styles.controls}>
                          <Tooltip label={`Draw box for ${animal.preferred_common_name || animal.name}`}>
                            <ActionIcon
                              onClick={() => handleActivateDrawingMode(animal)}
                              disabled={isDrawingMode && activeSpeciesForDrawing?.id !== animal.id}
                              variant={activeSpeciesForDrawing?.id === animal.id ? "filled" : "outline"}
                              style={{
                                backgroundColor: activeSpeciesForDrawing?.id === animal.id ? animalColor : undefined,
                                borderColor: animalColor, // Always use animalColor for border
                                color: activeSpeciesForDrawing?.id === animal.id ? 'white' : animalColor // Text color
                              }}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                           {boxesForThisSpecies > 0 && (
                            <Tooltip label={`Clear ${boxesForThisSpecies} box(es) for ${animal.preferred_common_name || animal.name}`}>
                              <ActionIcon color="red" variant="subtle" onClick={() => clearBoxesForSpecies(animal.id)}>
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <NumberInput
                            value={countForThisSpecies}
                            onChange={(value) => handleCountChange(animal.id, value)}
                            min={1}
                            max={100}
                            style={{ width: 70 }}
                          />
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleRemoveAnimal(animal.id)}
                            className={styles.removeButton}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Flex>
            )}
            <Group mt="xs" grow wrap="nowrap">
              <Checkbox
                classNames={checkboxClasses}
                label="Human Present"
                checked={humanPresent}
                onChange={(event) =>
                  setHumanPresent(event.currentTarget.checked)
                }
                wrapperProps={{
                  onClick: () => setHumanPresent((c) => !c),
                }}
              />
              <Checkbox
                classNames={checkboxClasses}
                label="Vehicle Present"
                checked={vehiclePresent}
                onChange={(event) =>
                  setVehiclePresent(event.currentTarget.checked)
                }
                wrapperProps={{
                  onClick: () => setVehiclePresent((c) => !c),
                }}
              />
            </Group>
          </GridCol>
          {noAnimalsVisible ||
          selection.length > 0 ||
          humanPresent ||
          vehiclePresent ? (
            <Button
              color="blue"
              fullWidth
              mt="md"
              radius="md"
              onClick={handleSaveObservations}
              loading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Observations"}
            </Button>
          ) : (
            <Button
              color="blue"
              variant="outline"
              fullWidth
              mt="md"
              radius="md"
              onClick={handleNoAnimalsClick}
              loading={isSaving}
            >
              No Animals Visible
            </Button>
          )}
          {selection.length === 0 &&
            !noAnimalsVisible &&
            !humanPresent &&
            !vehiclePresent && (
              <Text color="dimmed" align="center" mt="md">
                Select animals from the search results to add observations, mark
                as "No Animals Visible", or indicate human/vehicle presence
              </Text>
            )}
          <Group mt="md">
            <SpeciesConsensusBadges
              speciesConsensus={currentImage.speciesConsensus}
            />
            <ObservationHistoryPopover mediaID={currentImage.mediaID} />
          </Group>
        </Grid>
      </Card>
      <Modal
        opened={enlargedImage}
        onClose={() => setEnlargedImage(false)}
        size="100%"
        padding={0}
        styles={{
          inner: { padding: 0 },
          modal: { maxWidth: "100%" },
        }}
      >
        <div
          style={{
            // width: "90vw",
            // height: "90vh",
            display: "flex",
            // justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <TransformWrapper
            defaultScale={1}
            wheel={{ step: 0.4 }} // how fast you zoom with the mouse wheel
            pinch={{ step: 0.2 }} // how fast you zoom with pinch gesture
            // doubleClick={{ disabled: true }} // optional: disable double-click zoom
          >
            <TransformComponent>
              <Image
                src={currentImage.publicURL}
                fit="contain"
                // height="100vh"
                // width="90vw"
                alt="Enlarged wildlife image"
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </Modal>
    </>
  );
}

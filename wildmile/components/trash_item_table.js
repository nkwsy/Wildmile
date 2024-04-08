"use client";
import { useState, useCallback, useRef } from "react";
import {
  Button,
  SimpleGrid,
  Box,
  Group,
  NumberInput,
  Table,
  ScrollArea,
  rem,
  NumberInputHandlers,
} from "@mantine/core";
import cx from "clsx";
import classes from "/styles/table.module.css";

function TrashItemTable(props) {
  const [scrolled, setScrolled] = useState(false);
  const [openMaterials, setOpenMaterials] = useState({});
  const [inputValues, setInputValues] = useState({}); // State for input values

  // Sort on category
  const sortedItems = props.items.sort((a, b) => {
    const nameA = (a.catagory || a.catagory).toUpperCase(); // ignore upper and lowercase
    const nameB = (b.catagory || b.catagory).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });

  // Reverse sort items based on material
  const materialSortedItems = sortedItems.sort((a, b) => {
    const nameA = (a.material || a.material).toUpperCase(); // ignore upper and lowercase
    const nameB = (b.material || b.material).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return 1;
    }
    if (nameA > nameB) {
      return -1;
    }

    // names must be equal
    return 0;
  });

  const toggleMaterial = useCallback((material) => {
    setOpenMaterials((prev) => ({ ...prev, [material]: !prev[material] }));
  }, []);

  // Assuming items are already sorted by material
  const groupedByMaterial = materialSortedItems.reduce((acc, item) => {
    (acc[item.material] = acc[item.material] || []).push(item);
    return acc;
  }, {});

  const rows = [];
  const materialButtons = [];

  for (const material in groupedByMaterial) {
    const items = groupedByMaterial[material];
    const handlersRef = useRef < NumberInputHandlers > null;
    // const [inputValues, setInputValues] = useState({});

    materialButtons.push(
      <Button
        key={material}
        onClick={() => toggleMaterial(material)}
        variant="outline"
        color="gray"
        radius="sm"
        size="xs"
        style={{ width: "100%" }}
      >
        {material}
      </Button>
    );
    rows.push(
      <tr
        key={material}
        onClick={() => toggleMaterial(material)}
        className={`${classes.materialHeader} ${classes.row}`} // Combine both classes
      >
        <td colSpan="4">
          {material} ({items.length} items)
        </td>
      </tr>
    );

    if (openMaterials[material]) {
      items.forEach((item) => {
        rows.push(
          <tr
            key={item.name + item.material}
            className={classes.row}
            onDoubleClick={() => handlersRef.current?.increment()}
          >
            <td>
              <NumberInput
                size="xs"
                defaultValue={0}
                maw={60}
                min={0}
                // label={item.catagory}
                // description={item.description}
              />
            </td>
            <td>{item.material}</td>
            <td size="xxs" maw="100">
              {item.description}
            </td>
            <td>{item.catagory}</td>
          </tr>
        );
      });
    }
  }

  return (
    <ScrollArea
      mt={"md"}
      p={"md"}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <SimpleGrid cols={5} spacing="xs">
        {materialButtons}
      </SimpleGrid>
      <Table withColumnBorders highlightOnHover>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Total</th>
            <th>Material</th>
            <th>Description</th>
            <th>Category</th>
          </tr>
        </thead>

        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export default TrashItemTable;

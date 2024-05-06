"use client";
import {
  Group,
  Box,
  Stack,
  Text,
  Accordion,
  AccordionItem,
  AccordionControl,
  AccordionTitle,
  AccordionChevron,
  AccordionPanel,
  Tooltip,
  Button,
} from "@mantine/core";
import { useState } from "react";
import classes from "styles/TrashItemAccordion.module.css";
import TrashInputCounter from "./trash/TrashInputCounter";
// import { getItemsFromLog } from "app/actions/TrashActions";
// import { useParams } from "next/navigation";

// todo: may want to use mantine nested features https://mantine.dev/form/nested/

function TrashItemAccordian({ props }) {
  const [value, setValue] = useState(null);
  const all_materials = [];
  const dataArray = Object.values(props.items);

  // Open all accordions
  const openAll = () => {
    setValue(all_materials);
  };
  // Sort on category
  // const sortedItems = props.items.sort(((a, b) => {
  // if (Array.isArray(dataArray)) {
  const sortedItems = dataArray.sort((a, b) => {
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
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });

  // Assuming items are already sorted by material
  const groupedByMaterial = materialSortedItems.reduce((acc, item) => {
    (acc[item.material] = acc[item.material] || []).push(item);
    return acc;
  }, {});

  const accordionItems = [];

  // Rest of the code...
  // } else {
  //   console.error("dataArray is not an array");
  // }
  for (const material in groupedByMaterial) {
    all_materials.push(material);
    const items = groupedByMaterial[material];
    const itemRows = [];
    items.forEach((item) => {
      itemRows.push(
        <div key={item._id} className={classes.item}>
          <Group justify="space-between">
            <Tooltip
              label={`${item.name}${
                item.description ? ` - ${item.description}` : ""
              }`}
              openDelay={500}
            >
              <Text className={`${classes.title} ${classes.truncateText}`}>
                {item.name}
              </Text>
            </Tooltip>
            <Text className={classes.catagory}>{item.catagory}</Text>
            <TrashInputCounter
              initialTrash={item.quantity}
              itemId={item._id}
              logId={props.logId}
            />
          </Group>
        </div>
      );
    });

    accordionItems.push(
      <div key={material}>
        <AccordionItem key={material} value={material} onChange={setValue}>
          <AccordionControl className={classes.accordionControl}>
            <Text className={classes.material}> {material}</Text>
          </AccordionControl>
          <AccordionPanel>
            <Stack gap="0px">{itemRows}</Stack>
          </AccordionPanel>
        </AccordionItem>
      </div>
    );
  }

  return (
    <>
      <Group>
        <Button variant="light" onClick={openAll}>
          Expand All
        </Button>
        <Button variant="light" onClick={() => setValue(null)}>
          Collapse All
        </Button>
      </Group>
      <Accordion
        className={classes.accordionContainer}
        value={value}
        onChange={setValue}
        multiple
      >
        {accordionItems}
      </Accordion>
    </>
  );
}

export default TrashItemAccordian;

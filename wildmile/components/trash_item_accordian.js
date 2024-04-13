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
  Divider,
} from "@mantine/core";
import classes from "styles/TrashItemAccordion.module.css";
import TrashInputCounter from "./trash/TrashInputCounter";
// import { getItemsFromLog } from "app/actions/TrashActions";
// import { useParams } from "next/navigation";

// todo: may want to use mantine nested features https://mantine.dev/form/nested/

function TrashItemAccordian({ props }) {
  const dataArray = Object.values(props.items);

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
    const items = groupedByMaterial[material];
    const itemRows = [];
    items.forEach((item) => {
      itemRows.push(
        <>
          <Group key={item._id}>
            <Box className={classes.item} key={item._id}>
              <Group>
                <Text className={classes.title}>{item.name}</Text>
                <Text className={classes.catagory}>{item.catagory} lbs</Text>
                <TrashInputCounter
                  initialTrash={item.quantity}
                  itemId={item._id}
                  logId={props.logId}
                />
              </Group>
            </Box>
          </Group>
        </>
      );
    });

    accordionItems.push(
      <AccordionItem key={material} value={material}>
        <AccordionControl className={classes.accordionControl}>
          <Text className={classes.material}> {material}</Text>
        </AccordionControl>
        <AccordionPanel>
          <Stack>{itemRows}</Stack>
        </AccordionPanel>
      </AccordionItem>
    );
  }

  return (
    <>
      <Accordion className={classes.accordionContainer}>
        {accordionItems}
      </Accordion>
    </>
  );
}

export default TrashItemAccordian;

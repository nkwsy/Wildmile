"use client";
import {
  Group,
  Stack,
  NumberInput,
  Text,
  Accordion,
  AccordianItem,
  AccordionChevron,
  AccordionPanel,
} from "@mantine/core";
import classes from "styles/TrashItemAccordion.module.css";
import TrashInputCounter from "./trash/TrashInputCounter";
import { getItemsFromLog } from "app/actions/TrashActions";
// import { useParams } from "next/navigation";

// todo: may want to use mantine nested features https://mantine.dev/form/nested/

function TrashItemAccordian({ logId }) {
  const props = getItemsFromLog(logId);
  const items = props.items;
  // const params = useParams();

  // set the item data to an array
  // const dataArray = items;
  const dataArray = Object.values(items);

  // Sort on category
  // const sortedItems = props.items.sort(((a, b) => {
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

  for (const material in groupedByMaterial) {
    const items = groupedByMaterial[material];
    const itemRows = [];
    items.forEach((item) => {
      itemRows.push(
        <Group key={item._id} justify="space-between">
          <Text>{item.name}</Text>
          {/* <TrashInputCounter props={...props.form.getInputProps(`items.${item._id}.quantity`)} /> */}
          {/* <TrashInputCounter
            initialTrash={item.quantity}
            itemId={item._id}
            logId={logId}
          /> */}
          {/* use in App Router
          <TrashInputCounter
            initialTrash={item.quantity}
            itemId={item._id}
            logId={params.Id}
          /> */}
          {/* <input type="number" {...props.form.getInputProps(`items.${item._id}.quantity`)} /> */}
        </Group>
      );
    });

    accordionItems.push(
      <AccordionItem key={material} value={material}>
        <AccordionControl className={classes.accordionControl}>
          {material}
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

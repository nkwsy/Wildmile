"use client";
import { updateTrashCount, getTrashCount } from "app/actions/TrashActions";
import { useState, useRef, useEffect } from "react";
import {
  NumberInput,
  NumberInputHandlers,
  Button,
  ActionIcon,
  Group,
} from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import classes from "styles/TrashItemAccordion.module.css";
export default function TrashInputCounter({ initialTrash, itemId, logId }) {
  // export default function TrashInputCounter({ itemId, logId }) {
  const handlersRef = useRef(null);
  // const [initialTrash, setInitialTrash] = useState(0);

  // useEffect(() => {
  //   // Replace this with your actual query
  //   const fetchInitialTrash = async () => {
  //     const response = await getTrashCount(itemId, logId);
  //     setInitialTrash(response);
  //   };

  //   fetchInitialTrash();
  // }, []); // Empty dependency array ensures this runs once on mount

  //   const [count, setCount] = useState(initialTrash);
  //   console.log("count", count);
  return (
    <>
      <Group justify="flex-end">
        <NumberInput
          className={classes.numberInput}
          maxLength={3}
          handlersRef={handlersRef}
          allowNegative={false}
          hideControls
          defaultValue={initialTrash}
          onValueChange={async (e) => {
            const updatedCount = await updateTrashCount(
              itemId,
              logId,
              e.floatValue
            );
            //   setCount(await updatedCount);
          }}
        />
        <ActionIcon
          onClick={async () => {
            handlersRef.current?.increment();
          }}
          variant="default"
        >
          <IconPlus />
        </ActionIcon>

        <ActionIcon
          onClick={() => handlersRef.current?.decrement()}
          variant="default"
        >
          <IconMinus />
        </ActionIcon>
      </Group>
    </>
  );
}

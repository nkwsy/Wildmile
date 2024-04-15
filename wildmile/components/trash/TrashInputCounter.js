"use client";
import { updateTrashCount } from "app/actions/TrashActions";
import { useState, useRef } from "react";
import {
  NumberInput,
  NumberInputHandlers,
  Button,
  ActionIcon,
} from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import classes from "styles/TrashItemAccordion.module.css";
export default function TrashInputCounter({ initialTrash, itemId, logId }) {
  const handlersRef = useRef(null);
  console.log("initialTrash", initialTrash);
  //   const [count, setCount] = useState(initialTrash);
  //   console.log("count", count);
  return (
    <>
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
    </>
  );
}

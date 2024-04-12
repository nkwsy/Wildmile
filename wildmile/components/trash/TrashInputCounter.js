"use client";
// import { updateTrashCount } from "app/actions/TrashActions";
// import { useState } from "react";
// import { NumberInput } from "@mantine/core";

// export default function TrashInputCounter({ initialTrash, itemId, logId }) {
//   const [count, setCount] = useState(initialTrash);

//   return (
//     <>
//       <NumberInput
//         allowNegative={false}
//         value={count}
//         onChange={async (e) => {
//           const updatedCount = await updateTrashCount(
//             itemId,
//             logId,
//             e.target.value
//           );
//           setCount(updatedCount);
//         }}
//       />
//     </>
//   );
// }

// use in app router
// ("use client");
import { updateTrashCount } from "/app/actions/TrashActions";
import { useState } from "react";
import { NumberInput } from "@mantine/core";

export default function TrashInputCounter({ initialTrash, itemId, logId }) {
  const [count, setCount] = useState(initialTrash);

  return (
    <>
      <NumberInput
        allowNegative={false}
        value={count}
        onChange={async (e) => {
          const updatedCount = await updateTrashCount(
            itemId,
            logId,
            e.target.value
          );
          setCount(updatedCount);
        }}
      />
    </>
  );
}

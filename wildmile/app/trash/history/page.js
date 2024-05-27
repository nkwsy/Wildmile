// import TrashHistory from "components/trash/TrashHistory";
"use server";
import { getTrashLogByUser } from "app/actions/TrashActions";
import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";

import { Link } from "next/link";
import {
  Table,
  Button,
  Group,
  Text,
  Container,
  Paper,
  Title,
} from "@mantine/core";
import classes from "/styles/table.module.css";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { TrashLogTable, TrashLogData } from "components/trash/TrashHistory";
// // Truncate string to a certain length for table

export default async function Page() {
  // const logs = await GetTrashTableData();
  // const rows = convertDataToRows(logs);
  return (
    <>
      <Container>
        <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
          <Title mb={30} align="center">
            My Trash logs
          </Title>
          <TrashLogData />
          {/* <Suspense>{renderTrashForm(params.Id)}</Suspense> */}
        </Paper>
      </Container>
    </>
  );
}

export async function GetTrashTableData() {
  const session = await getSession({ headers });
  if (session._id) {
    const logs = await getTrashLogByUser(session._id);
    return (
      <>
        <TrashLogTable data={logs} />
      </>
    );
  }
}
// Model.paginate({}, options, function (err, result) {
//   // result.docs
//   // result.totalDocs = 100
//   // result.limit = 10
//   // result.page = 1
//   // result.totalPages = 10
//   // result.hasNextPage = true
//   // result.nextPage = 2
//   // result.hasPrevPage = false
//   // result.prevPage = null
//   // result.pagingCounter = 1
// });
// function Th({ children, reversed, sorted, onSort }) {
//   const Icon = sorted
//     ? reversed
//       ? IconChevronUp
//       : IconChevronDown
//     : IconSelector;
//   return (
//     <th className={classes.th}>
//       <UnstyledButton onClick={onSort} className={classes.control}>
//         <Group position="apart">
//           <Text fw={500} fz="sm">
//             {children}
//           </Text>
//           <Center className={classes.icon}>
//             <Icon size="0.9rem" stroke={1.5} />
//           </Center>
//         </Group>
//       </UnstyledButton>
//     </th>
//   );
// }

// function filterData(data, search) {
//   const query = search.toLowerCase().trim();
//   return data.filter((item) =>
//     keys(data[0]).some((key) => String(item[key]).toLowerCase().includes(query))
//   );
// }

// function sortData(data, payload) {
//   const { sortBy } = payload;

//   if (!sortBy) {
//     return filterData(data, payload.search);
//   }

//   return filterData(
//     [...data].sort((a, b) => {
//       if (payload.reversed) {
//         return String(b[sortBy]).localeCompare(a[sortBy]);
//       }

//       return String(a[sortBy]).localeCompare(b[sortBy]);
//     }),
//     payload.search
//   );
// }

// // Truncate string to a certain length for table
// function truncateString(str, num) {
//   if (str.length <= num) {
//     return str;
//   }
//   return str.slice(0, num) + "...";
// }

// /* Retrieves plant(s) data from mongodb database */
// export async function GetTrashLogs() {
//   await dbConnect();

//   /* find all the data in our database */
//   const result = await TrashLog.find({ deleted: false }, [
//     "-__v",
//     "-createdAt",
//     "-updatedAt",
//   ]).sort({ timeEnd: -1 });

//   const trashLogs = result.map((doc) => {
//     const log = doc.toObject();

//     // We need to convert everything to be JSON serializable
//     log._id = String(log._id);
//     log.timeStart = Date.parse(log.timeStart);
//     log.timeEnd = Date.parse(log.timeEnd);
//     console.log(log);
//     log.creator = String(log.creator);
//     return log;
//   });
//   return { props: { logs: trashLogs } };
// }

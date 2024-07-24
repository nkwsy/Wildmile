"use client";
import { useState, useEffect, Children } from "react";
import { Table, Button, Group, Text, TextInput } from "@mantine/core";
import {
  IconChevronRight,
  IconChevronLeft,
  IconSearch,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import classes from "/styles/table.module.css";
import Link from "next/link";
import { getTrashLogByUser } from "app/actions/TrashActions";
import { useUser } from "lib/hooks";

function truncateString(str, num) {
  if (!str) return "";
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}

export function TrashLogTable({ children }) {
  return (
    <Table
      horizontalSpacing="xs"
      verticalSpacing="xs"
      withColumnBorders
      striped
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th>Site</Table.Th>
          <Table.Th>People</Table.Th>
          <Table.Th>Notes</Table.Th>
          <Table.Th>Edit</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{children}</Table.Tbody>
    </Table>
  );
}

export function convertDataToRows(page_data) {
  return page_data.map((row, i) => (
    <Table.Tr key={i} className={classes.tr}>
      <Table.Td>{new Date(row.timeStart).toDateString()}</Table.Td>
      <Table.Td>{new Date(row.timeStart).toLocaleTimeString("en-US")}</Table.Td>
      <Table.Td>{row.site}</Table.Td>
      <Table.Td>{row.numOfParticipants}</Table.Td>
      <Table.Td>{truncateString(row.notes, 60)}</Table.Td>
      <Table.Td>
        <Group justify="center" position="apart" spacing={3}>
          <Button.Group>
            <Button
              justify="center"
              fullWidth
              component={Link}
              href={`/trash/log/${row._id}`}
              leftSection={<IconPencil />}
            >
              Edit
            </Button>
          </Button.Group>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));
}
export function TrashLogData() {
  //   console.log("Data:", data);
  //   const rows = convertDataToRows(data);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: isUserInfoLoading } = useUser();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isUserInfoLoading) return;
        console.log("User:", user);
        const response = await getTrashLogByUser(user._id);
        console.log("Response:", response);
        setData(response);
        // setRows(convertDataToRows(response.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isUserInfoLoading, user]);

  if (loading) {
    return <div />;
  }

  return (
    <>
      <TrashLogTable>{convertDataToRows(data)}</TrashLogTable>
      {/* {data.length > 0 ? (
        convertDataToRows(data)
      ) : (
        <Table.Tr>
          <Table.Td colSpan={5}>
            <Text weight={500} align="center">
              Nothing found
            </Text>
          </Table.Td>
        </Table.Tr>
      )} */}
    </>
  );
}
// export default function TrashHistory(props) {
//   const [search, setSearch] = useState("");
//   const [sortedData, setSortedData] = useState(props.logs);
//   const [sortBy, setSortBy] = useState("timeEnd");
//   const [pageNum, setPageNum] = useState(0);
//   const [totalPages, setNumPages] = useState(0);
//   const [reverseSortDirection, setReverseSortDirection] = useState(false);

//   function convertDataToRows(data) {
//     const starting_index = Math.max((totalPages - pageNum) * 10, 0);
//     const page_data = data.slice(starting_index, starting_index + 10);

//     return page_data.map((row, i) => (
//       <Table.Tr key={row.timeEnd + i} className={classes.tr}>
//         <Table.Td suppressHydrationWarning>
//           {new Date(row.timeStart).toDateString()}
//         </Table.Td>
//         <Table.Td suppressHydrationWarning>
//           {new Date(row.timeStart).toLocaleTimeString("en-US")}
//         </Table.Td>
//         <Table.Td>{row.site}</Table.Td>
//         <Table.Td>{row.numOfParticipants}</Table.Td>
//         <Table.Td>{truncateString(row.notes, 60)}</Table.Td>
//         <Table.Td>
//           <Group justify="center" position="apart" spacing={3}>
//             <Button.Group>
//               <Button
//                 justify="center"
//                 fullWidth
//                 component={Link}
//                 href={`/trashlog/${row._id}`}
//                 leftSection={<IconPencil />}
//               >
//                 Edit
//               </Button>
//               <Button
//                 onClick={() => {
//                   // Handle Delete Logic Here
//                 }}
//                 justify="center"
//                 fullWidth
//                 leftSection={<IconTrash />}
//                 color="red" // Optional, if you want to give a different color to delete button
//               >
//                 Delete
//               </Button>
//             </Button.Group>
//           </Group>
//         </Table.Td>
//       </Table.Tr>
//     ));
//   }

//   const [rows, setRows] = useState(convertDataToRows(props.logs));

//   return (

//       <Table
//         horizontalSpacing="xs"
//         verticalSpacing="xs"
//         withColumnBorders
//         striped
//       >
//         <Table.Thead>
//           <Table.Tr>
//             <Table.Th
//               // sorted={sortBy === 'timeStart'}
//               reversed={reverseSortDirection}
//               onSort={() => setSorting("timeStart")}
//             >
//               Date
//             </Table.Th>
//             <Table.Th
//               // sorted={sortBy === 'timeStart'}
//               reversed={reverseSortDirection}
//               onSort={() => setSorting("timeStart")}
//             >
//               Time
//             </Table.Th>
//             <Table.Th
//               // sorted={sortBy === 'site'}
//               reversed={reverseSortDirection}
//               onSort={() => setSorting("site")}
//             >
//               Site
//             </Table.Th>
//             <Table.Th
//               // sorted={sortBy === 'numOfParticipants'}
//               reversed={reverseSortDirection}
//               onSort={() => setSorting("numOfParticipants")}
//             >
//               People
//             </Table.Th>
//             <Table.Th>Notes</Table.Th>
//             <Table.Th>Edit</Table.Th>
//           </Table.Tr>
//         </Table.Thead>
//         <Table.Tbody>
//           {rows.length > 0 ? (
//             rows
//           ) : (
//             <Table.Tr>
//               <Table.Td colSpan={5}>
//                 <Text weight={500} align="center">
//                   Nothing found
//                 </Text>
//               </Table.Td>
//             </Table.Tr>
//           )}
//         </Table.Tbody>
//       </Table>
//       <Group justify="center">
//         <Button
//           leftSection={<IconChevronLeft />}
//           mt="xl"
//           disabled={pageNum == 0}
//           onClick={previousPage}
//         >
//           Previous Page
//         </Button>
//         <Button
//           rightSection={<IconChevronRight />}
//           mt="xl"
//           disabled={rows.length < 10}
//           onClick={nextPage}
//         >
//           Next Page
//         </Button>
//       </Group>
//   );
// }

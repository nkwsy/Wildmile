"use client";
// import { useState } from "react";
// import {
//   Table,
//   ScrollArea,
//   UnstyledButton,
//   Group,
//   Button,
//   Text,
//   Center,
//   TextInput,
//   keys,
// } from "@mantine/core";
// import TrashLog from "../../../models/Trash";
// import dbConnect from "../../../lib/db/setup";
// import Link from "next/link";
// import {
//   IconSelector,
//   IconChevronDown,
//   IconChevronUp,
//   IconChevronRight,
//   IconChevronLeft,
//   IconSearch,
//   IconPencil,
//   IconTrash,
// } from "@tabler/icons-react";

// import classes from "/styles/table.module.css";
// const options = {
//   page: 1,
//   limit: 10,
//   collation: {
//     locale: "en",
//   },
// };
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

//   const setSorting = (field) => {
//     const reversed = field === sortBy ? !reverseSortDirection : false;
//     setReverseSortDirection(reversed);
//     setSortBy(field);
//     setSortedData(sortData(sortedData, { sortBy: field, reversed, search }));
//     setRows(convertDataToRows(sortedData));
//   };

//   const handleSearchChange = (event) => {
//     const { value } = event.currentTarget;
//     setSearch(value);
//     setSortedData(
//       sortData(sortedData, {
//         sortBy,
//         reversed: reverseSortDirection,
//         search: value,
//       })
//     );
//     setRows(convertDataToRows(sortedData));
//   };

//   async function nextPage() {
//     if (pageNum == totalPages) {
//       const timeSorted = sortData(sortedData, {
//         sortBy: "timeEnd",
//         reversed: false,
//         search: "",
//       });
//       const res = await fetch(
//         "/api/trash/logs?" +
//           new URLSearchParams({ timeEnd: timeSorted[0].timeEnd }),
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       if (res.ok) {
//         const converted = (await res.json()).map((log) => {
//           return {
//             ...log,
//             ...{
//               timeStart: Date.parse(log.timeStart),
//               timeEnd: Date.parse(log.timeEnd),
//             },
//           };
//         });

//         setSortedData(
//           sortData(sortedData.concat(converted), {
//             sortBy: sortBy,
//             reversed: reverseSortDirection,
//             search: search,
//           })
//         );
//         setPageNum(pageNum + 1);
//         setNumPages(totalPages + 1);
//         setRows(convertDataToRows(sortedData));
//       } else {
//         //error
//       }
//     } else {
//       setPageNum(pageNum + 1);
//       setRows(convertDataToRows(sortedData));
//     }
//   }

//   async function previousPage() {
//     setPageNum(pageNum - 1);
//     setRows(convertDataToRows(sortedData));
//   }

//   return (
//     <ScrollArea my="5rem">
//       <TextInput
//         placeholder="Search by any field"
//         mb="md"
//         icon={<IconSearch size="0.9rem" stroke={1.5} />}
//         value={search}
//         onChange={handleSearchChange}
//       />
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
//     </ScrollArea>
//   );
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

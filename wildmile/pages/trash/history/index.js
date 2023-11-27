import { useState } from 'react'
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Button,
  Text,
  Center,
  TextInput,
  rem,
  ActionIcon,
} from '@mantine/core'
import Router from 'next/router'
// import { keys } from '@mantine/utils'
import TrashLog from '../../../models/Trash'
import dbConnect from '../../../lib/db/setup'
import { IconSelector, IconChevronDown, IconChevronUp, IconChevronRight, IconChevronLeft, IconSearch, IconPencil, IconTrash} from '@tabler/icons-react'
import classes from '../../../styles/table.module.css'
// const useStyles = createStyles((theme) => ({
//   th: {
//     padding: '0 !important',
//   },

//   tr: {
//     '&:hover': {
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
//       cursor: 'pointer',
//     },
//   },

//   control: {
//     width: '100%',
//     padding: `${theme.spacing.xs} ${theme.spacing.md}`,

//     '&:hover': {
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
//     },
//   },

//   icon: {
//     width: rem(21),
//     height: rem(21),
//     borderRadius: rem(21),
//   },
// }))


function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size="0.9rem" stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  )
}

function filterData(data, search) {
  const query = search.toLowerCase().trim()
  return data.filter((item) =>
    keys(data[0]).some((key) => String(item[key]).toLowerCase().includes(query))
  )
}

function sortData(data, payload) {
  const { sortBy } = payload

  if (!sortBy) {
    return filterData(data, payload.search)
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return String(b[sortBy]).localeCompare(a[sortBy])
      }

      return String(a[sortBy]).localeCompare(b[sortBy])
    }),
    payload.search
  )
}

// Truncate string to a certain length for table
function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
}


export default function TrashHistory(props) {
  const [search, setSearch] = useState('')
  const [sortedData, setSortedData] = useState(props.logs)
  const [sortBy, setSortBy] = useState('timeEnd')
  const [pageNum, setPageNum] = useState(0)
  const [totalPages, setNumPages] = useState(0)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)

  function convertDataToRows(data) {
    const starting_index = Math.max((totalPages - pageNum) * 10, 0)
    const page_data = data.slice(starting_index, starting_index + 10)
    return page_data.map((row, i) => (
      <tr key={row.timeEnd + i} className={classes.tr}>
        <td suppressHydrationWarning >{new Date(row.timeStart).toDateString()}</td>
        <td suppressHydrationWarning >{new Date(row.timeStart).toLocaleTimeString('en-US', {timeZone: "CST"})}</td>
        <td>{row.site}</td>
        <td>{row.numOfParticipants}</td>
        <td>{truncateString(row.notes, 60)}</td>
<td>
  <Group position="apart" spacing={3}>
    <ActionIcon 
        onClick={() => {
            Router.push(`/trash/edit/${row._id}`)
        }}
        title="Edit"
    >
        <IconPencil />
    </ActionIcon>
    <ActionIcon 
        onClick={() => {
            // Handle Delete Logic Here
        }}
        title="Delete"
        color="red" // Optional, if you want to give a different color to delete button
    >
        <IconTrash />
    </ActionIcon>
  </Group>
</td>
      </tr>
    ))
  }

  const [rows, setRows] = useState(convertDataToRows(props.logs))

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
    setSortedData(sortData(sortedData, { sortBy: field, reversed, search }))
    setRows(convertDataToRows(sortedData))
  }

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget
    setSearch(value)
    setSortedData(sortData(sortedData, { sortBy, reversed: reverseSortDirection, search: value }))
    setRows(convertDataToRows(sortedData))
  }

  async function nextPage() {
    if (pageNum == totalPages) {
      const timeSorted = sortData(sortedData, { sortBy: 'timeEnd', reversed: false, search: '' })
      const res = await fetch('/api/trash/logs?' + new URLSearchParams({ timeEnd: timeSorted[0].timeEnd }), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const converted = (await res.json()).map((log) => {
          return { ...log, ...{ 'timeStart': Date.parse(log.timeStart), 'timeEnd': Date.parse(log.timeEnd) } }
        })

        setSortedData(sortData(sortedData.concat(converted), { sortBy: sortBy, reversed: reverseSortDirection, search: search }))
        setPageNum(pageNum + 1)
        setNumPages(totalPages + 1)
        setRows(convertDataToRows(sortedData))
      } else {
        //error
      }
    } else {
      setPageNum(pageNum + 1)
      setRows(convertDataToRows(sortedData))
    }

  }

  async function previousPage() {
    setPageNum(pageNum - 1)
    setRows(convertDataToRows(sortedData))
  }

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        icon={<IconSearch size="0.9rem" stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table horizontalSpacing="xs" verticalSpacing="xs" withColumnBorders striped>
        <thead>
          <tr >
            <Th
              sorted={sortBy === 'timeStart'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('timeStart')}
            >
              Date
            </Th>
             <Th
              sorted={sortBy === 'timeStart'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('timeStart')}
            >
              Time
            </Th>
            <Th
              sorted={sortBy === 'site'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('site')}
            >
              Site
            </Th>
            <Th
              sorted={sortBy === 'numOfParticipants'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('numOfParticipants')}
            >
             People 
            </Th>
            <Th>
              Notes
            </Th>
            <Th>
              Edit
            </Th>
            
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={5}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Group position="center">
        <Button leftSection={<IconChevronLeft />} mt="xl" disabled={pageNum == 0} onClick={previousPage}>
          Previous Page
        </Button>
        <Button rightSection={<IconChevronRight />} mt="xl" disabled={rows.length < 10} onClick={nextPage}>
          Next Page
        </Button>
      </Group>
    </ScrollArea>
  )
}

/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps() {
  await dbConnect()

  /* find all the data in our database */
  const result = await TrashLog.find({ 'deleted': false }, ['-__v', '-createdAt', '-updatedAt']).limit(100).sort('-timeEnd')

  const trashLogs = result.map((doc) => {
    const log = doc.toObject()

    // We need to convert everything to be JSON serializable
    log._id = String(log._id)
    log.timeStart = Date.parse(log.timeStart)
    log.timeEnd = Date.parse(log.timeEnd)
    log.creator = String(log.creator)

    return log
  })
  return { props: { logs: trashLogs } }
}
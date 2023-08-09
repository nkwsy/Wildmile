import { useState } from 'react'
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
} from '@mantine/core'
import { keys } from '@mantine/utils'
import TrashLog from '../../models/Trash'
import dbConnect from '../../lib/db/setup'
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react'

const useStyles = createStyles((theme) => ({
  th: {
    padding: '0 !important',
  },

  tr: {
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },  },

  control: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  icon: {
    width: rem(21),
    height: rem(21),
    borderRadius: rem(21),
  },
}))


function Th({ children, reversed, sorted, onSort }) {
  const { classes } = useStyles()
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
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
  )
}

function sortData(data, payload) {
  const { sortBy } = payload

  if (!sortBy) {
    return filterData(data, payload.search)
  }

  return filterData(
    [...data].sort((a, b) => {
      console.log(a)
      console.log(sortBy)
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy])
      }

      return a[sortBy].localeCompare(b[sortBy])
    }),
    payload.search
  )
}

export default function TrashHistory(props) {
  const [search, setSearch] = useState('')
  const [sortedData, setSortedData] = useState(props.logs)
  const [sortBy, setSortBy] = useState(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
    setSortedData(sortData(props.logs, { sortBy: field, reversed, search }))
  }

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget
    setSearch(value)
    setSortedData(sortData(props.logs, { sortBy, reversed: reverseSortDirection, search: value }))
  }

  const rows = sortedData.map((row) => (
    <tr key={row.timeEnd}>
      <td>{row.timeEnd}</td>
      <td>{row.site}</td>
      <td>{row.trashiness}</td>
      <td>{row.wind}</td>
      <td>{row.cloud}</td>
      <td>{row.temp}</td>
    </tr>
  ))

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        icon={<IconSearch size="0.9rem" stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} sx={{ tableLayout: 'fixed' }}>
        <thead>
          <tr >
            <Th
              sorted={sortBy === 'timeEnd'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('timeEnd')}
            >
              Time
            </Th>
            <Th
              sorted={sortBy === 'site'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('site')}
            >
              site
            </Th>
            <Th
              sorted={sortBy === 'trashiness'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('trashiness')}
            >
              Trashiness
            </Th>
            <Th
              sorted={sortBy === 'wind'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('wind')}
            >
              Wind
            </Th>
            <Th
              sorted={sortBy === 'cloud'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('cloud')}
            >
              Cloudiness
            </Th>
            <Th
              sorted={sortBy === 'temp'}
              reversed={reverseSortDirection}
              onSort={() => setSorting('temp')}
            >
              Temperature
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={Object.keys(data[0]).length}>
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </ScrollArea>
  )
}

/* Retrieves plant(s) data from mongodb database */
export async function getStaticProps() {
  await dbConnect()

  /* find all the data in our database */
  const result = await TrashLog.find({ 'deleted': false }, ['-__v', '-createdAt', '-updatedAt']).limit(10).sort('-timeEnd')

  const trashLogs = result.map((doc) => {
    const log = doc.toObject()

    // We need to convert everything to be JSON serializable
    log._id = String(log._id)
    log.timeStart = String(log.timeStart)
    log.timeEnd = String(log.timeEnd)
    log.creator = String(log.creator)

    return log
  })
  return { props: { logs: trashLogs } }
}
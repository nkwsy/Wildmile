import { useState } from 'react'
import { createStyles, NumberInput, Table, ScrollArea, rem } from '@mantine/core'


const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
    zIndex: 10,

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
        }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },

}))

export default function TrashItemTable(props) {
  const { classes, cx } = useStyles()
  const [scrolled, setScrolled] = useState(false)

  // Sort on category
  const sortedItems = props.items.sort(((a, b) => {
    const nameA = (a.catagory || a.catagory).toUpperCase() // ignore upper and lowercase
    const nameB = (b.catagory || b.catagory).toUpperCase() // ignore upper and lowercase
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }

    // names must be equal
    return 0
  }))

  // Reverse sort items based on material
  const materialSortedItems = sortedItems.sort(((a, b) => {
    const nameA = (a.material || a.material).toUpperCase() // ignore upper and lowercase
    const nameB = (b.material || b.material).toUpperCase() // ignore upper and lowercase
    if (nameA < nameB) {
      return 1
    }
    if (nameA > nameB) {
      return -1
    }

    // names must be equal
    return 0
  }))

  const rows = materialSortedItems.map((item) => (
    <tr key={item.name + item.material}>
      <td><NumberInput
        defaultValue={0}
        {...props.form.getInputProps('items.' + item.name)}
        maw={80}
        min={0}
      /></td>
      <td>{item.material}</td>
      <td>{item.description}</td>
      <td>{item.catagory}</td>
    </tr>
  ))


  return (
    <ScrollArea h={500} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Total</th>
            <th>Material</th>
            <th>Description</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  )
}

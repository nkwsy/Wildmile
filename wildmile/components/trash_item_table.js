import { useState, useCallback, useRef } from 'react'
import { createStyles, Button, SimpleGrid, Box, Group NumberInput, NumberInputHandlers, Table, ScrollArea, rem } from '@mantine/core'
import styles from '../styles.module.css';


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
  // Header styles for each material accordion
  materialHeader: {
    backgroundColor: theme.colors.gray[2], // Choose appropriate shade of grey
    cursor: 'pointer', // Indicate that it's clickable
    fontWeight: 'bold', // Optional: Make it bold to stand out
    row: {height: 'xs',}, // Smaller row height
  },
  // Smaller row height
  row: {
  height: 'xs', // Set an appropriate height value
},

// Grid styles
gridContainer: {
  display: 'flex',
  flexWrap: 'wrap',   // Allows boxes to wrap to the next line
  gap: '20px',        // Spacing between boxes
  justifyContent: 'space-between',  // Distributes boxes evenly
},
materialBox: {
  flex: '1 1 calc(50% - 20px)', // Roughly one-third of the container minus the gap
  border: `1px solid ${theme.colors.gray[4]}`, 
  padding: '10px',
  borderRadius: '5px', 
  backgroundColor: theme.colors.gray[1],
  overflowY: 'auto',  // In case of too many inputs, adds a scrollbar
  transition: 'max-height 0.2s ease-in-out', // smooth transition for expanding/collapsing
  maxHeight: '300px',  // Adjust based on your preference
},

// gridContainer: {
//   display: 'grid',
//   gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Adjust as needed
//   gap: '20px', // Adjust as needed
// },
// materialBox: {
//   border: `1px solid ${theme.colors.gray[4]}`, // Adjust as needed
//   padding: '10px',
//   borderRadius: '5px', // Optional rounded corners
//   backgroundColor: theme.colors.gray[1],
// },


}))

function TrashItemTable(props) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);
  const [openMaterials, setOpenMaterials] = useState({});
  const [inputValues, setInputValues] = useState({});  // State for input values


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

  const toggleMaterial = useCallback((material) => {
    setOpenMaterials(prev => ({ ...prev, [material]: !prev[material] }));
  }, []);

  // Assuming items are already sorted by material
  const groupedByMaterial = materialSortedItems.reduce((acc, item) => {
    (acc[item.material] = acc[item.material] || []).push(item);
    return acc;
  }, {});

  const rows = [];
  const materialButtons = [];


  for (const material in groupedByMaterial) {
    const items = groupedByMaterial[material];
    const handlersRef = useRef<NumberInputHandlers>(null);
    // const [inputValues, setInputValues] = useState({});

    materialButtons.push(
      <Button
        key={material}
        onClick={() => toggleMaterial(material)}
        variant="outline"
        color="gray"
        radius="sm"
        size="xs"
        style={{ width: '100%' }}
      >
        {material}
      </Button>
    );
    rows.push(
      <tr key={material} onClick={() => toggleMaterial(material)}
    className={`${classes.materialHeader} ${classes.row}`} // Combine both classes
        >
        <td colSpan="4">{material} ({items.length} items)</td>
      </tr>
    );

    if (openMaterials[material]) {
      items.forEach(item => {
        rows.push(
  
          <tr 
          key={item.name + item.material} 
          className={classes.row} 
          onDoubleClick={() => handlersRef.current?.increment()}

          >
            <td>
              <NumberInput
                size="xs"
                defaultValue={0}
                maw={60}
                min={0}
                // label={item.catagory}
                // description={item.description}

              />
            </td>
            <td>{item.material}</td>
            <td className={styles.tdResponsiveText} >{item.description}</td>
            <td>{item.catagory}</td>
          </tr>

        );
      });
    }
  }

  return (
    <ScrollArea h={1000} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <SimpleGrid cols={5} spacing="xs">
        {materialButtons}
      </SimpleGrid>
      <Table withColumnBorders highlightOnHover>
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
  );
}

export default TrashItemTable;
import { Group, Stack, NumberInput, Text, Accordion } from '@mantine/core'


function TrashItemAccordian(props) {
  // set the item data to an array
  const dataArray = Object.values(props.items);


  // Sort on category
  // const sortedItems = props.items.sort(((a, b) => {
  const sortedItems = dataArray.sort(((a, b) => {
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
      return -1
    }
    if (nameA > nameB) {
      return 1
    }

    // names must be equal
    return 0
  }))

  // Assuming items are already sorted by material
  const groupedByMaterial = materialSortedItems.reduce((acc, item) => {
    (acc[item.material] = acc[item.material] || []).push(item);
    return acc;
  }, {});

  const accordionItems = [];


  for (const material in groupedByMaterial) {
    const items = groupedByMaterial[material]
    const itemRows = []
    items.forEach(item => {
      itemRows.push(
        <Group key={item._id} justify="space-between">
          <Text>
            {item.name}
          </Text>
            {/* <NumberInput
              {...props.form.getInputProps(`items.${item._id}.quantity`)}
              allowNegative={false}
            /> */}
            <input type="number" {...props.form.getInputProps(`items.${item._id}.quantity`)} />
        </Group>)
    })

    accordionItems.push(
      <Accordion.Item key={material} value={material}>
        <Accordion.Control>{material}</Accordion.Control>
        <Accordion.Panel>
          <Stack>{
            itemRows
          }
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    )
  }

  return (
    <Accordion>
      {accordionItems}
    </Accordion>
  );
}

export default TrashItemAccordian;
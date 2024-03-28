import { Accordion, Text, Group, Avatar } from "@mantine/core";

export default function PlantCards(props) {
  const cardPlants = props.cardPlants;
  return (
    <>
      <Accordion chevronPosition="right" variant="contained">
        {cardPlants.map((item, index) => (
          <Accordion.Item value={String(index)} key={item.title}>
            <Accordion.Control>
              <Group wrap="nowrap">
                <Avatar src={item.image} radius="sm" size="xl" />
                <div>
                  <Text>{item.title}</Text>
                  <Text size="sm" color="dimmed" fw={400}>
                    {item.subtitle}
                  </Text>
                </div>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">{item.title}</Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}

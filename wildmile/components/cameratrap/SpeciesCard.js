import {
  SimpleGrid,
  Text,
  Card,
  Image,
  Badge,
  Modal,
  Title,
  Container,
  TextInput,
  Textarea,
  Button,
  CardSection,
  Group,
  Chip,
  ChipGroup,
  ActionIcon,
} from "@mantine/core";
import Link from "next/link";
import classes from "/styles/imagecard.module.css";
import { IconBrandWikipedia } from "@tabler/icons-react";
import { useSelection } from "components/cameratrap/ContextCamera";

export function SpeciesCards(results) {
  const result_values = results.map((result) => ({
    id: result.id,
    title: result.preferred_common_name || result.name || "",
    subtitle: result.name || "",
    image: result.default_photo?.medium_url || "/No_plant_image.jpg",
    description: result.rank,
    family: result.iconic_taxon_name || "",
    wiki: result.wikipedia_url || "",
    inat_result: result,
    // color: result.rank === "species" ? "#0875c8" : "#da833b",

    // tags: result.family, result.family_common_name ?? null.filter(Boolean),
  }));
  return result_values;
}

export default function Species({ results }) {
  const [selection, setSelection] = useSelection();

  console.log("Results:", results);
  if (results.length < 0) {
    return;
  }
  const result_values = SpeciesCards(results);

  const toggleSelection = (result) => {
    setSelection((prev) => {
      const isSelected = prev.some((item) => item.id === result.inat_result.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== result.inat_result.id);
      } else {
        return [...prev, result.inat_result];
      }
    });
  };

  return (
    <>
      {result_values.map((result, index) => (
        <Card
          key={index}
          onClick={() => toggleSelection(result)}
          withBorder
          padding="lg"
          radius="md"
          style={{
            cursor: "pointer",
            border: selection.some((item) => item.id === result.inat_result.id)
              ? "2px solid blue"
              : undefined,
            position: "relative",
            overflow: "hidden",
            height: "220px", // Adjust this value as needed
          }}
        >
          <Image
            src={result.image || "/No_plant_image.jpg"}
            alt={result.title}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {result.wiki && (
            <ActionIcon
              variant="default"
              component={Link}
              href={result.wiki}
              rel="noopener noreferrer"
              target="_blank"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 2,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <IconBrandWikipedia
                style={{ width: "70%", height: "70%" }}
                stroke={1}
              />
            </ActionIcon>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(255, 255, 255, 0.8)",
              padding: "0.5rem",
              backdropFilter: "blur(5px)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Title className={classes.title}>{result.title}</Title>
              <Text
                size="sm"
                color="dimmed"
                fs="italic"
                c="dimmed"
                className={classes.subtitle}
              >
                {result.subtitle}
              </Text>

              <Group align="center" spacing="xs">
                <Text size="sm" color="dimmed" className={classes.description}>
                  {result.family}
                </Text>
                <Badge
                  variant="light"
                  color={
                    result.inat_result.rank === "species"
                      ? "blue"
                      : result.inat_result.rank === "genus"
                      ? "grape"
                      : result.inat_result.rank === "family"
                      ? "green"
                      : "orange"
                  }
                >
                  {result.description}
                </Badge>
              </Group>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

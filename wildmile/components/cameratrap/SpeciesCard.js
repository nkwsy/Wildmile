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
  Paper,
} from "@mantine/core";
import Link from "next/link";
import classes from "./SpeciesCard.module.css";
import { IconBrandWikipedia } from "@tabler/icons-react";
import { useSelection } from "components/cameratrap/ContextCamera";

export function SpeciesCards(results) {
  const result_values = results.map((result) => ({
    id: result.id,
    title: result.preferred_common_name || result.name || "",
    subtitle: result.name || "",
    image:
      result.name === "Canis familiaris"
        ? "/dog.jpg"
        : result.default_photo?.medium_url || "/No_plant_image.jpg",
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
        <Paper
          key={index}
          onClick={() => toggleSelection(result)}
          className={classes.card}
          data-selected={
            selection.some((item) => item.id === result.inat_result.id) ||
            undefined
          }
        >
          <Image
            src={result.image || "/No_plant_image.jpg"}
            alt={result.title}
            className={classes.image}
          />
          <Badge
            variant="outline"
            color={
              result.inat_result.rank === "species"
                ? "blue"
                : result.inat_result.rank === "subspecies"
                ? "blue"
                : result.inat_result.rank === "genus"
                ? "grape"
                : result.inat_result.rank === "family"
                ? "green"
                : result.inat_result.rank === "class"
                ? "orange"
                : "yellow"
            }
            // style={{ marginLeft: "auto" }}
            className={classes.badge}
          >
            {result.description}
          </Badge>
          {result.wiki && (
            <ActionIcon
              variant="default"
              component={Link}
              href={result.wiki}
              rel="noopener noreferrer"
              target="_blank"
              className={classes.wikiButton}
            >
              <IconBrandWikipedia className={classes.wikiIcon} stroke={1} />
            </ActionIcon>
          )}

          <div className={classes.overlay}>
            <div className={classes.content}>
              <Title className={classes.title}>{result.title}</Title>

              <Group align="center" spacing="xs">
                {/* <Text className={classes.description}>{result.family}</Text> */}
                <Text className={classes.subtitle}>{result.subtitle}</Text>
              </Group>
            </div>
          </div>
        </Paper>
      ))}
    </>
  );
}

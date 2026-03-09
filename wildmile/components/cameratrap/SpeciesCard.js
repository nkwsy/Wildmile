import React, { useState, useEffect } from "react";
import {
  Text,
  Image,
  Badge,
  Modal,
  Title,
  Group,
  ActionIcon,
  Paper,
  SimpleGrid,
  Stack,
  Skeleton,
  Anchor,
  Tabs,
  Divider,
} from "@mantine/core";
import classes from "./SpeciesCard.module.css";
import {
  IconInfoCircle,
  IconBrandWikipedia,
  IconExternalLink,
} from "@tabler/icons-react";
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
  }));
  return result_values;
}

// Check if a selection item matches an iNaturalist result.
// Matches by id (normal clicks) OR by name (URL-seeded stubs that
// only have a name property). The name fallback is a single string
// comparison so there's no meaningful performance cost.
function isSelectedSpecies(item, inatResult) {
  if (item.id != null && inatResult.id != null && item.id === inatResult.id) {
    return true;
  }
  if (item.name && inatResult.name && item.name === inatResult.name) {
    return true;
  }
  return false;
}

const VARIANT_LABELS = {
  male: "Male",
  female: "Female",
  juvenile: "Juvenile",
};

function SpeciesInfoModal({ result, opened, onClose }) {
  const [variantPhotos, setVariantPhotos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const isBird = result.family === "Aves";
  const taxonId = result.inat_result?.id || result.inat_result?.taxonId;

  useEffect(() => {
    if (!opened || fetched || !taxonId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/species/photos?taxon_id=${taxonId}&is_bird=${isBird}`,
        );
        if (res.ok && !cancelled) {
          setVariantPhotos(await res.json());
        }
      } catch (e) {
        console.error("Error fetching variant photos:", e);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFetched(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opened, taxonId, isBird, fetched]);

  const hasVariants = variantPhotos && Object.keys(variantPhotos).length > 0;

  const variantKeys = hasVariants ? Object.keys(variantPhotos) : [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Title order={3}>{result.title}</Title>
          <Text size="sm" c="dimmed" fs="italic">
            {result.subtitle}
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        <Group gap="xs">
          <Badge
            variant="light"
            color={
              result.inat_result.rank === "species"
                ? "blue"
                : result.inat_result.rank === "genus"
                  ? "grape"
                  : result.inat_result.rank === "family"
                    ? "green"
                    : "gray"
            }
          >
            {result.description}
          </Badge>
          {result.family && (
            <Badge variant="light" color="teal">
              {result.family}
            </Badge>
          )}
        </Group>

        <Image
          src={result.image || "/No_plant_image.jpg"}
          alt={result.title}
          radius="md"
          mah={300}
          fit="contain"
        />

        {result.wiki && (
          <Anchor
            href={result.wiki}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
          >
            <Group gap={4}>
              <IconBrandWikipedia size={16} />
              Wikipedia
              <IconExternalLink size={14} />
            </Group>
          </Anchor>
        )}

        {loading && (
          <>
            <Divider label="Loading variant photos..." labelPosition="center" />
            <SimpleGrid cols={4} spacing="xs">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} height={100} radius="md" />
              ))}
            </SimpleGrid>
          </>
        )}

        {hasVariants && (
          <>
            <Divider
              label={
                isBird ? "Male / Female / Juvenile" : "Appearance Variants"
              }
              labelPosition="center"
            />
            <Tabs defaultValue={variantKeys[0]}>
              <Tabs.List>
                {variantKeys.map((key) => (
                  <Tabs.Tab key={key} value={key}>
                    {VARIANT_LABELS[key] || key}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              {variantKeys.map((key) => (
                <Tabs.Panel key={key} value={key} pt="sm">
                  <SimpleGrid cols={2} spacing="xs">
                    {variantPhotos[key].map((photo, i) => (
                      <Image
                        key={i}
                        src={photo.url}
                        alt={`${result.title} - ${VARIANT_LABELS[key]}`}
                        radius="sm"
                        h={140}
                        fit="cover"
                      />
                    ))}
                  </SimpleGrid>
                </Tabs.Panel>
              ))}
            </Tabs>
          </>
        )}

        {fetched && !loading && !hasVariants && (
          <Text size="sm" c="dimmed" ta="center">
            No variant photos available for this species.
          </Text>
        )}
      </Stack>
    </Modal>
  );
}

export default function Species({ results }) {
  const [selection, setSelection] = useSelection();
  const [infoTarget, setInfoTarget] = useState(null);

  if (results.length < 0) {
    return;
  }
  const result_values = SpeciesCards(results);

  const toggleSelection = (result) => {
    setSelection((prev) => {
      const isSelected = prev.some((item) =>
        isSelectedSpecies(item, result.inat_result),
      );
      if (isSelected) {
        return prev.filter(
          (item) => !isSelectedSpecies(item, result.inat_result),
        );
      } else {
        return [...prev, result.inat_result];
      }
    });
  };

  const handleInfoClick = (e, result) => {
    e.stopPropagation();
    setInfoTarget(result);
  };

  return (
    <>
      {result_values.map((result, index) => (
        <Paper
          key={index}
          onClick={() => toggleSelection(result)}
          className={classes.card}
          data-selected={
            selection.some((item) =>
              isSelectedSpecies(item, result.inat_result),
            ) || undefined
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
            className={classes.badge}
          >
            {result.description}
          </Badge>
          <ActionIcon
            variant="subtle"
            size="sm"
            className={classes.infoButton}
            onClick={(e) => handleInfoClick(e, result)}
            aria-label="Species info"
          >
            <IconInfoCircle size={18} stroke={1.5} />
          </ActionIcon>

          <div className={classes.overlay}>
            <div className={classes.content}>
              <Title className={classes.title}>{result.title}</Title>

              <Group align="center" spacing="xs">
                <Text className={classes.subtitle}>{result.subtitle}</Text>
              </Group>
            </div>
          </div>
        </Paper>
      ))}
      {infoTarget && (
        <SpeciesInfoModal
          result={infoTarget}
          opened={!!infoTarget}
          onClose={() => setInfoTarget(null)}
        />
      )}
    </>
  );
}

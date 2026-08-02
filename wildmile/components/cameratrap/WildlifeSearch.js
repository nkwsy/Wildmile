"use client";
import React, { useState } from "react";
import {
  Group,
  Stack,
  Paper,
  Accordion,
  Box,
  Text,
  Collapse,
  Button,
} from "@mantine/core";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import TaxaSearch from "./TaxaSearch";
import PredefinedSpeciesSidebar from "./PredefinedSpeciesSidebar";
import { IconSearch } from "@tabler/icons-react";
const WildlifeSearch = () => {
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [opened, { toggle, close }] = useDisclosure(false);
  const clickOutsideRef = useClickOutside(() => close());

  const handleSpeciesSelect = (species) => {
    setSelectedSpecies(species.name || species);
  };

  return (
    <Paper
      ref={clickOutsideRef}
      shadow="xs"
      p="xs"
      withBorder
      radius="md"
      h="100%"
      id="wildlife-search-container"
    >
      <Stack gap="xs" h="100%">
        <Box
          style={{
            flex: "0 1 auto",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PredefinedSpeciesSidebar
            onSpeciesSelect={handleSpeciesSelect}
            searchControl={
              <Button
                id="species-search-button"
                variant="default"
                leftSection={<IconSearch size={16} />}
                onClick={toggle}
                size="xs"
                style={{ width: 110 }}
              >
                Find New
              </Button>
            }
          />
        </Box>
        <Collapse in={opened}>
          <TaxaSearch initialQuery={selectedSpecies} />
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default WildlifeSearch;

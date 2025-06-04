"use client";
import React, { useState } from "react";
import {
  Group,
  Paper,
  Accordion,
  Box,
  Text,
  Collapse,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import TaxaSearch from "./TaxaSearch";
import PredefinedSpeciesSidebar from "./PredefinedSpeciesSidebar";
import { IconSearch } from "@tabler/icons-react";
import RecentSpecies from "./RecentSpecies";
const WildlifeSearch = () => {
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [opened, { toggle }] = useDisclosure(false);

  const handleSpeciesSelect = (species) => {
    setSelectedSpecies(species);
  };

  return (
    <Paper shadow="xs" p="md" style={{ maxWidth: "800px", width: "100%" }}>
      <Button variant="default" leftSection={<IconSearch />} onClick={toggle}>
        Search All Species
      </Button>

      <Collapse in={opened}>
        <TaxaSearch initialQuery={selectedSpecies} />
      </Collapse>
      <Box mt="md" style={{ height: "80vh", overflowY: "auto" }}>
        <PredefinedSpeciesSidebar onSpeciesSelect={handleSpeciesSelect} />
      </Box>
    </Paper>
  );
};

export default WildlifeSearch;

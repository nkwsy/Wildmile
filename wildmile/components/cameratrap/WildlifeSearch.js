"use client";
import React, { useState } from "react";
import { Group, Paper, Accordion, Box } from "@mantine/core";
import TaxaSearch from "./TaxaSearch";
import PredefinedSpeciesSidebar from "./PredefinedSpeciesSidebar";

const WildlifeSearch = () => {
  const [selectedSpecies, setSelectedSpecies] = useState("");

  const handleSpeciesSelect = (species) => {
    setSelectedSpecies(species);
  };

  return (
    <Paper shadow="xs" p="md" style={{ maxWidth: '800px', width: '100%' }}>
      <Accordion>
        <Accordion.Item value="search">
          <Accordion.Control>Wildlife Search</Accordion.Control>
          <Accordion.Panel>
            <TaxaSearch initialQuery={selectedSpecies} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Box mt="md" style={{ height: '800px', overflowY: 'auto' }}>
        <PredefinedSpeciesSidebar onSpeciesSelect={handleSpeciesSelect} />
      </Box>
    </Paper>
  );
};

export default WildlifeSearch;

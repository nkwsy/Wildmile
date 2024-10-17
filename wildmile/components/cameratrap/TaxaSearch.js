"use client";
// components/TaxaSearch.js
import React, { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Paper,
  SimpleGrid,
  Button,
  Group,
  Text,
  Switch,
} from "@mantine/core";
import classes from "/styles/WildlifeSidebar.module.css";
import SpeciesCard from "./SpeciesCard";

const TaxaSearch = ({ initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [taxonomyClass, setTaxonomyClass] = useState("");
  const [chicagoOnly, setChicagoOnly] = useState(true);

  const taxonomyClasses = [
    { value: "40151", label: "Mammals" },
    { value: "3", label: "Birds" },
    { value: "26036", label: "Reptiles" },
    { value: "20978", label: "Amphibians" },
    { value: "47158", label: "Insects" },
  ];

  // You might want to add a useEffect to update the query when initialQuery changes
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async () => {
    try {
      let apiUrl = `https://api.inaturalist.org/v1/taxa?q=${query}`;
      
      if (taxonomyClass) {
        apiUrl += `&taxon_id=${taxonomyClass}`;
      }
      
      if (chicagoOnly) {
        apiUrl += `&place_id=674`; // Chicago's place ID
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResults([]);
    }
  };

  return (
    <Paper shadow="xs" p="xl">
      <h2>Wildlife Search</h2>
      <Group>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search for wildlife"
          className={classes.searchInput}
        />
        <Select
          data={taxonomyClasses}
          value={taxonomyClass}
          onChange={setTaxonomyClass}
          placeholder="Filter by taxonomy class"
          className={classes.taxonomySelect}
        />
      </Group>
      <Group mt="md">
        <Switch
          checked={chicagoOnly}
          onChange={(event) => setChicagoOnly(event.currentTarget.checked)}
          label="Chicago area only"
        />
        <Button onClick={handleSearch}>Search</Button>
      </Group>
      {results.length > 0 ? (
        <SimpleGrid
          mt={40}
          cols={{ base: 2, sm: 2, lg: 5, xl: 4 }}
          breakpoints={[
            { maxWidth: "62rem", cols: 3, spacing: "md" },
            { maxWidth: "48rem", cols: 2, spacing: "sm" },
            { maxWidth: "36rem", cols: 1, spacing: "sm" },
          ]}
        >
          <SpeciesCard results={results} />
        </SimpleGrid>
      ) : (
        <Text mt={20}>No results found. Try a different search term or taxonomy class.</Text>
      )}
    </Paper>
  );
};

export default TaxaSearch;

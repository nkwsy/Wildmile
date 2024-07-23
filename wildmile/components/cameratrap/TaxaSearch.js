"use client";
// components/TaxaSearch.js
import React, { useState, useEffect } from "react";
import {
  Sidebar,
  Navbar,
  TextInput,
  Select,
  Card,
  Image,
  Text,
  Paper,
  Box,
  SimpleGrid,
  Button,
  Group,
} from "@mantine/core";
import classes from "/styles/WildlifeSidebar.module.css";
import SpeciesCard from "./SpeciesCard";
import axios from "axios";
import { useSelection } from "./ContextCamera";

const TaxaSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${query}`
      );
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for taxa"
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {results.map((taxon) => (
          <div key={taxon.id}>
            <h3>{taxon.name}</h3>
            <p>{taxon.preferred_common_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WildlifeSidebar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [taxonomyClass, setTaxonomyClass] = useState("");
  const [defaultAnimals, setDefaultAnimals] = useState([]);
  // const [selected, setSelected] = useState(null);
  const [selection, setSelection] = useSelection();

  const taxonomyClasses = [
    { value: "Mammalia", label: "Mammals" },
    { value: "Aves", label: "Birds" },
    { value: "Reptilia", label: "Reptiles" },
    { value: "Amphibia", label: "Amphibians" },
    { value: "Insecta", label: "Insects" },
  ];

  useEffect(() => {
    // Fetch default animals (limited number)
    const fetchDefaultAnimals = async () => {
      try {
        const response = await axios.get(
          "https://api.inaturalist.org/v1/taxa",
          {
            params: {
              rank: "species",
              per_page: 10, // Limit the number of default animals
            },
          }
        );
        setDefaultAnimals(response.data.results);
      } catch (error) {
        console.error("Error fetching default animals:", error);
      }
    };
    fetchDefaultAnimals();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${query}&class=${taxonomyClass}`
      );
      const data = await response.json();
      console.log("Search results:", data.results);
      setResults(data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    // <Sidebar className={classes.sidebar}>
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
        {selection && <Text>{selection}</Text>}
      </Group>
      <Button onClick={handleSearch}>Search</Button>
      <SimpleGrid
        mt={40}
        cols={{ base: 2, sm: 2, lg: 5, xl: 4 }}
        breakpoints={[
          { maxWidth: "62rem", cols: 3, spacing: "md" },
          { maxWidth: "48rem", cols: 2, spacing: "sm" },
          { maxWidth: "36rem", cols: 1, spacing: "sm" },
        ]}
      >
        {selection &&
          selection.map((taxon) => (
            <Card
              key={taxon.id}
              shadow="sm"
              p="lg"
              m="md"
              className={classes.resultItem}
            >
              <Card.Section>
                <Image
                  src={
                    taxon.image
                      ? taxon.default_photo.square_url
                      : "https://via.placeholder.com/150"
                  }
                  fit="contain"
                  height={160}
                  className={classes.galleryImage}
                  alt={taxon.title}
                />
              </Card.Section>
              <Text>{taxon.title}</Text>
            </Card>
          ))}
        {results.length > 0 && <SpeciesCard results={results} />}

        {/* {results.length > 0
            ? results.map((taxon) => (
                <Card
                  key={taxon.id}
                  shadow="sm"
                  p="lg"
                  m="md"
                  className={classes.resultItem}
                >
                  <Card.Section>
                    <Image
                      src={
                        taxon.default_photo
                          ? taxon.default_photo.square_url
                          : "https://via.placeholder.com/150"
                      }
                      fit="contain"
                      height={160}
                      className={classes.galleryImage}
                      alt={taxon.name}
                    />
                  </Card.Section>
                  <Text>
                    {taxon.preferred_common_name || taxon.name}
                  </Text>

                </Card>
              ))
            : defaultAnimals.map((taxon) => (
                <Card
                  key={taxon.id}
                  shadow="sm"
                  p="lg"
                  m="md"
                  className={classes.resultItem}
                >
                  <Card.Section>
                    <Image
                      src={
                        taxon.default_photo
                          ? taxon.default_photo.square_url
                          : "https://via.placeholder.com/150"
                      }
                      height={160}
                      alt={taxon.name}
                    />
                  </Card.Section>
                  <Text weight={500}>
                    {taxon.preferred_common_name || taxon.name}
                  </Text>
                </Card>
              ))} */}
      </SimpleGrid>
    </Paper>
  );
};

export default TaxaSearch;

"use client";
import React, { useState, useEffect } from "react";
import { Accordion, List, Loader, SimpleGrid } from "@mantine/core";
import Species from "./SpeciesCard";

const predefinedSpecies = {
  Mammals: [
    "Canis latrans", "Castor canadensis", "Ondatra zibethicus", "Marmota monax",
    "Sylvilagus floridanus", "Sciurus carolinensis", "Sciurus niger", "Tamias Striatus",
    "Lasionycteris noctivagans", "Myotis lucifugus", "Eptesicus fuscus", "Lasiurus borealis",
    "Procyon lotor", "Rattus norvegicus", "Apodemus sylvaticus", "Peromyscus maniculatus",
    "Microtus pennsylvanicus", "Mephitis mephitis", "Neovision vision", "Odocoileus virginianus",
    "Vulpes vulpes", "Lontra canadensis", "Didelphis virginiana", "Mammalia"
  ],
  Reptiles: [
    "Trachemys scripta elegans", "Chelydra Serpentina", "Chrysemys picta", "Apalone spinifera",
    "Thaminophis sirtalis", "Storeria dejaki", "Nerodia sipedon", "Reptilia"
  ],
  Amphibians: [
    "Lithobates catesbeianus", "Anaxyrus americanus", "Pseudacris crucifer", "Pseudacris triseriata",
    "Lithobates pipiens", "Rana clamitans", "Amphibia"
  ],
  Birds: [
    "Branta canadensis", "Branta hutchinsii", "Anser caerulescens", "Anser albifrons",
    // ... (include all bird species)
    "Cardinalis cardinalis", "Pheucticus ludovicianus", "Passerina cyanea", "Spiza americana",
    "Aves"
  ],
  Insects: [] // Add insect species if available
};

const PredefinedSpeciesSidebar = ({ onSpeciesSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [speciesData, setSpeciesData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchSpeciesData = async (species) => {
    try {
      const response = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(species)}&limit=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
    } catch (error) {
      console.error("Error fetching species data:", error);
    }
    return null;
  };

  const fetchCategoryData = async (category) => {
    setLoading(true);
    const speciesPromises = predefinedSpecies[category].map(fetchSpeciesData);
    const results = await Promise.all(speciesPromises);
    const newSpeciesData = results.filter(result => result !== null);
    setSpeciesData(prevData => ({ ...prevData, [category]: newSpeciesData }));
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryData(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <h2>Common Species</h2>
      <Accordion onChange={handleCategorySelect}>
        {Object.entries(predefinedSpecies).map(([category, species]) => (
          <Accordion.Item key={category} value={category}>
            <Accordion.Control>{category}</Accordion.Control>
            <Accordion.Panel>
              {loading ? (
                <Loader />
              ) : (
                <SimpleGrid
                  cols={3}
                  spacing="md"
                  breakpoints={[
                    { maxWidth: '62rem', cols: 2, spacing: 'md' },
                    { maxWidth: '48rem', cols: 1, spacing: 'sm' },
                  ]}
                >
                  <Species 
                    results={speciesData[category] || []} 
                    onSpeciesSelect={onSpeciesSelect}
                  />
                </SimpleGrid>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
};

export default PredefinedSpeciesSidebar;
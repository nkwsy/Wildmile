"use client";
import React, { useState, useEffect } from "react";
import {
  Loader,
  SimpleGrid,
  SegmentedControl,
  Stack,
  Text,
  Center,
  Tooltip,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconClock, IconRefresh } from "@tabler/icons-react";
import Species from "./SpeciesCard";

const predefinedSpecies = {
  Mammals: [
    "Canis latrans",
    "Castor canadensis",
    "Ondatra zibethicus",
    "Marmota monax",
    "Sylvilagus floridanus",
    "Sciurus carolinensis",
    "Sciurus niger",
    "Tamias Striatus",
    "Lasionycteris noctivagans",
    "Myotis lucifugus",
    "Eptesicus fuscus",
    "Lasiurus borealis",
    "Procyon lotor",
    "Rattus norvegicus",
    "Apodemus sylvaticus",
    "Peromyscus maniculatus",
    "Microtus pennsylvanicus",
    "Mephitis mephitis",
    "Neovision vision",
    "Odocoileus virginianus",
    "Vulpes vulpes",
    "Lontra canadensis",
    "Didelphis virginiana",
    "Mammalia",
  ],
  Reptiles: [
    "Trachemys scripta elegans",
    "Chelydra Serpentina",
    "Chrysemys picta",
    "Apalone spinifera",
    "Thaminophis sirtalis",
    "Storeria dejaki",
    "Nerodia sipedon",
    "Reptilia",
  ],
  Amphibians: [
    "Lithobates catesbeianus",
    "Anaxyrus americanus",
    "Pseudacris crucifer",
    "Pseudacris triseriata",
    "Lithobates pipiens",
    "Rana clamitans",
    "Amphibia",
  ],
  Birds: [
    "Branta canadensis",
    "Aix sponsa",
    "Anas platyrhynchos",
    "Lophodytes cucullatus",
    "Mergus merganser",
    "Mergus serrator",
    "Podilymus podiceps",
    "Chaetura pelagica",
    "Archilochus colubris",
    "Actitis macularius",
    "Larus argentatus",
    "Gavia immer",
    "Nannopterum auritum",
    "Botaurus lentiginosus",
    "Lxobrycus exilis",
    "Nycticorax nycticorax",
    "Nyctanassa Violacea",
    "Butorides virescens",
    "Ardea alba",
    "Ardea herodias",
    "Accipiter cooperii",
    "Bubo virginianus",
    "Megaceryle alcyon",
    "Falco sparverius",
    "Corvus brachyrrhynchos",
    "Sturnus vulgaris",
    "Podiceps auritus",
    "Columba livia",
    "Branta hutchinsii",
    "Anser caerulescens",
    "Anser albifrons",
    "Cardinalis cardinalis",
    "Pheucticus ludovicianus",
    "Passerina cyanea",
    "Spiza americana",
    "Aves",
  ],
  Insects: [], // Add insect species if available
};

const PredefinedSpeciesSidebar = ({ onSpeciesSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState("Mammals");
  const [speciesData, setSpeciesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentSpecies, setRecentSpecies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recent species data
  const fetchRecentSpecies = async () => {
    try {
      const response = await fetch(`/api/cameratrap/recent-species`, {
        cache: "no-store",
      });
      const data = await response.json();
      const speciesDetails = await Promise.all(
        data.map((item) => fetchSpeciesData(item.species))
      );
      return speciesDetails.filter((detail) => detail !== null);
    } catch (error) {
      console.error("Error fetching recent species:", error);
      return [];
    }
  };

  // Convert predefinedSpecies keys to format needed by SegmentedControl
  const categoryData = [
    {
      value: "recent",
      label: (
        <Tooltip label="Recently Used">
          <Center>
            <IconClock size={20} stroke={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    ...Object.keys(predefinedSpecies).map((category) => ({
      label: category,
      value: category,
    })),
  ];

  // Handle category selection/deselection
  const handleCategoryChange = async (newValue) => {
    if (newValue === selectedCategory) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(newValue);
      if (newValue === "recent" && !speciesData.recent) {
        setLoading(true);
        const recentData = await fetchRecentSpecies();
        setSpeciesData((prev) => ({ ...prev, recent: recentData }));
        setLoading(false);
      }
    }
  };

  // Fetch species data for a single species
  const fetchSpeciesData = async (species) => {
    try {
      const response = await fetch(
        `/api/species?species=${encodeURIComponent(species)}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching species data:", error);
      return null;
    }
  };

  // Fetch all categories data at once
  const fetchAllCategoriesData = async () => {
    setLoading(true);
    const allData = {};

    // Create promises for all categories
    const categoryPromises = Object.entries(predefinedSpecies).map(
      async ([category, speciesList]) => {
        const speciesPromises = speciesList.map(fetchSpeciesData);
        const results = await Promise.all(speciesPromises);
        return [category, results.filter((result) => result !== null)];
      }
    );

    // Wait for all categories to complete
    const results = await Promise.all(categoryPromises);

    // Convert results array to object
    results.forEach(([category, data]) => {
      allData[category] = data;
    });

    setSpeciesData(allData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllCategoriesData();
  }, []);

  const handleRefresh = async () => {
    if (selectedCategory === "recent") {
      setRefreshing(true);
      setLoading(true);
      const recentData = await fetchRecentSpecies();
      setSpeciesData((prev) => ({ ...prev, recent: recentData }));
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <>
      <Stack spacing="md">
        <Group position="apart">
          <Text size="lg" fw={500}>
            Common Species
          </Text>
          {selectedCategory === "recent" && (
            <ActionIcon
              onClick={handleRefresh}
              loading={refreshing}
              variant="subtle"
              disabled={loading}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          )}
        </Group>

        <SegmentedControl
          value={selectedCategory}
          onChange={handleCategoryChange}
          data={categoryData}
          size="md"
        />

        {loading ? (
          <Loader />
        ) : (
          selectedCategory && (
            <SimpleGrid
              cols={{ base: 3, lg: 3, xl: 4 }}
              spacing="md"
              // breakpoints={[
              //   { maxWidth: "62rem", cols: 2, spacing: "md" },
              //   { maxWidth: "48rem", cols: 1, spacing: "sm" },
              // ]}
            >
              <Species
                results={speciesData[selectedCategory] || []}
                onSpeciesSelect={onSpeciesSelect}
              />
            </SimpleGrid>
          )
        )}
      </Stack>
    </>
  );
};

export default PredefinedSpeciesSidebar;

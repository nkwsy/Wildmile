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
  Image,
} from "@mantine/core";
import { IconClock, IconRefresh } from "@tabler/icons-react";
import { Fish, Turtle, Bird, Rabbit, Bug } from "lucide-react";
import { FrogIcon } from "/styles/icons/Frog";

import Species from "./SpeciesCard";

const predefinedSpecies = {
  Mammals: [
    "Mammalia",
    "Canis familiaris",
    "Canis latrans",
    "Felis catus",
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
  ],
  Reptiles: [
    "Reptilia",
    "Trachemys scripta elegans",
    "Chelydra Serpentina",
    "Chrysemys picta",
    "Apalone spinifera",
    "Thamnophis sirtalis",
    "Storeria dekayi",
    "Nerodia sipedon",
  ],
  Amphibians: [
    "Amphibia",
    "Lithobates catesbeianus",
    "Anaxyrus americanus",
    "Pseudacris crucifer",
    "Pseudacris triseriata",
    "Lithobates pipiens",
    "Rana clamitans",
  ],
  Birds: [
    "Aves",

    "Anas platyrhynchos",
    "Branta canadensis",
    "Larus delawarensis",
    "Columba livia",
    "Sturnus vulgaris",
    "Passer domesticus",
    "Turdus migratorius",
    "Agelaius phoeniceus",
    "Corvus brachyrhynchos",
    "Nannopterum auritum",
    "Ardea herodias",
    "Nycticorax nycticorax",
    "Accipiter cooperii",
    "Actitis macularius",
    "Aix sponsa",
    "Anas acuta",
    "Anser albifrons",
    "Anser caerulescens",
    "Archilochus colubris",
    "Ardea alba",
    "Aythya affinis",
    "Aythya americana",
    "Aythya marila",
    "Bombycilla cedrorum",
    "Botaurus lentiginosus",
    "Branta hutchinsii",
    "Bubo virginianus",
    "Bucephala albeola",
    "Bucephala clangula",
    "Buteo jamaicensis",
    "Butorides virescens",
    "Cardinalis cardinalis",
    "Cathartes aura",
    "Chaetura pelagica",
    "Charadrius vociferus",
    "Colaptes auratus",
    "Cyanocitta cristata",
    "Cygnus olor",
    "Dumetella carolinensis",
    "Falco peregrinus",
    "Falco sparverius",
    "Gavia immer",
    "Grus canadensis",
    "Ixobrychus exilis",
    "Junco hyemalis",
    "Larus argentatus",
    "Lophodytes cucullatus",
    "Megaceryle alcyon",
    "Melanerpes erythrocephalus",
    "Melospiza melodia",
    "Mergus merganser",
    "Mergus serrator",
    "Nyctanassa violacea",
    "Pandion haliaetus",
    "Passerina cyanea",
    "Pheucticus ludovicianus",
    "Podiceps auritus",
    "Podilymbus podiceps",
    "Poecile atricapillus",
    "Quiscalus quiscula",
    "Spinus tristis",
    "Spiza americana",
    "Tyrannus tyrannus",
    "Zenaida macroura",
    "Zonotrichia albicollis",
  ],
  // Insects: ["Arthropoda"], // Add insect species if available
  Fish: [
    "Chordata",
    "Cyprinus carpio",
    "Lepomis macrochirus",
    "Micropterus salmoides",
    "Ictalurus punctatus",
    "Micropterus dolomieu",
    "Esox lucius",
    "Perca flavescens",
    "Pomoxis nigromaculatus",
    "Sander vitreus",
    "Lepomis gibbosus",
    "Ameiurus nebulosus",
    "Aplodinotus grunniens",
    "Amia calva",
    "Catostomus commersonii",
    "Dorosoma cepedianum",
    "Hypophthalmichthys molitrix",
    "Notemigonus crysoleucas",
    "Oncorhynchus mykiss",
    "Pimephales promelas",
    "Salvelinus namaycush",
  ],
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

  // Update the categoryData array
  //   ...Object.keys(predefinedSpecies).map((category) => ({
  //   label: category,
  //   value: category,
  // })),
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
    {
      value: "Mammals",
      label: (
        <Tooltip label="Mammals">
          <Center>
            <Rabbit strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Reptiles",
      label: (
        <Tooltip label="Reptiles">
          <Center>
            <Turtle strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Amphibians",
      label: (
        <Tooltip label="Amphibians">
          <Center>
            <FrogIcon strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Birds",
      label: (
        <Tooltip label="Birds">
          <Center>
            <Bird />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Fish",
      label: (
        <Tooltip label="Fish">
          <Center>
            <Fish />
          </Center>
        </Tooltip>
      ),
    },
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

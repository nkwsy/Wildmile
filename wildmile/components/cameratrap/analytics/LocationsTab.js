"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Grid,
  Badge,
  ThemeIcon,
  SimpleGrid,
  ScrollArea,
  Paper,
  Progress,
  SegmentedControl,
} from "@mantine/core";
import { IconMapPin, IconPaw, IconChartBar } from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

function LocationsMap({ locations }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapStyle, setMapStyle] = useState("outdoors-v12");
  const [mapReady, setMapReady] = useState(false);

  const mappable = locations.filter(
    (l) => l.coordinates && l.coordinates.length === 2,
  );
  const maxObs = Math.max(...mappable.map((l) => l.totalObservations), 1);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center =
      mappable.length > 0 ? mappable[0].coordinates : [-87.65, 41.9];

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center,
      zoom: 11,
    });

    m.on("load", () => {
      map.current = m;
      m.addControl(new mapboxgl.NavigationControl(), "top-right");
      setMapReady(true);
    });

    return () => m.remove();
  }, []);

  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
  }, [mapStyle]);

  const addMarkers = useCallback(() => {
    if (!mapReady || !map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    mappable.forEach((loc) => {
      const ratio = loc.totalObservations / maxObs;
      const size = Math.max(18, Math.round(14 + ratio * 30));
      const g = Math.round(120 + ratio * 135);
      const color = `rgb(30, ${g}, 90)`;

      const el = document.createElement("div");
      Object.assign(el.style, {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: color,
        border: "2px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: "bold",
        color: "white",
      });
      el.textContent = loc.speciesCount;

      const topList = loc.topSpecies
        .slice(0, 3)
        .map((s) => `${s.commonName || s.name}: ${s.count}`)
        .join("<br/>");

      const popup = new mapboxgl.Popup({ offset: size / 2 + 4 }).setHTML(`
        <div style="min-width:160px">
          <strong>${loc.locationName}</strong>
          ${loc.zone ? `<br/><span style="color:#666;font-size:12px">${loc.zone}${loc.projectArea ? ` — ${loc.projectArea}` : ""}</span>` : ""}
          <br/><span style="font-size:12px">${loc.totalObservations.toLocaleString()} observations</span>
          <br/><span style="font-size:12px">${loc.speciesCount} species · H' = ${loc.shannonDiversity}</span>
          ${topList ? `<hr style="margin:4px 0"/><span style="font-size:11px">${topList}</span>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(loc.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    if (mappable.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      mappable.forEach((l) => bounds.extend(l.coordinates));
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [mappable, maxObs, mapReady]);

  useEffect(() => {
    addMarkers();
  }, [addMarkers]);

  // Re-add markers after style change
  useEffect(() => {
    if (!map.current) return;
    const handler = () => addMarkers();
    map.current.on("style.load", handler);
    return () => map.current?.off("style.load", handler);
  }, [addMarkers]);

  if (!mappable.length) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Center py="md">
          <Text c="dimmed">No locations with coordinates available</Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card withBorder p={0} radius="md" style={{ position: "relative" }}>
      <SegmentedControl
        value={mapStyle}
        onChange={setMapStyle}
        size="xs"
        data={[
          { label: "Outdoors", value: "outdoors-v12" },
          { label: "Streets", value: "streets-v12" },
          { label: "Satellite", value: "satellite-streets-v12" },
        ]}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      />
      <div ref={mapContainer} style={{ height: 420, width: "100%" }} />
    </Card>
  );
}

export default function LocationsTab({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.startDate)
          params.set("startDate", filters.startDate.toISOString());
        if (filters.endDate)
          params.set("endDate", filters.endDate.toISOString());

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/locations?${params}`,
        );
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Locations fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!data?.locations?.length) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <ThemeIcon color="gray" variant="light" size={48} radius="xl">
            <IconMapPin size={24} />
          </ThemeIcon>
          <Text c="dimmed" size="lg">
            No location data available
          </Text>
          <Text c="dimmed" size="sm" ta="center" maw={400}>
            Location analytics require observations to be linked to deployments.
            Make sure images are assigned to deployments that have locations
            set.
          </Text>
        </Stack>
      </Center>
    );
  }

  const { locations } = data;

  const observationChart = locations.slice(0, 20).map((l) => ({
    location: l.locationName,
    Observations: l.totalObservations,
  }));

  const diversityChart = locations
    .filter((l) => l.shannonDiversity > 0)
    .slice(0, 20)
    .map((l) => ({
      location: l.locationName,
      "Shannon Diversity": l.shannonDiversity,
    }));

  const speciesChart = locations.slice(0, 20).map((l) => ({
    location: l.locationName,
    "Species Count": l.speciesCount,
  }));

  const maxObs = Math.max(...locations.map((l) => l.totalObservations), 1);

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text fw={500}>Total Locations</Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconMapPin size={20} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl" mt="sm">
            {locations.length}
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text fw={500}>Most Active</Text>
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
              <IconChartBar size={20} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="lg" mt="sm">
            {locations[0]?.locationName}
          </Text>
          <Text size="sm" c="dimmed">
            {locations[0]?.zone ? `${locations[0].zone} — ` : ""}
            {locations[0]?.totalObservations.toLocaleString()} observations
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text fw={500}>Most Diverse</Text>
            <ThemeIcon color="grape" variant="light" size="lg" radius="md">
              <IconPaw size={20} />
            </ThemeIcon>
          </Group>
          {(() => {
            const mostDiverse = [...locations].sort(
              (a, b) => b.shannonDiversity - a.shannonDiversity,
            )[0];
            return (
              <>
                <Text fw={700} size="lg" mt="sm">
                  {mostDiverse?.locationName}
                </Text>
                <Text size="sm" c="dimmed">
                  {mostDiverse?.zone ? `${mostDiverse.zone} — ` : ""}
                  Shannon H&apos; = {mostDiverse?.shannonDiversity}
                </Text>
              </>
            );
          })()}
        </Card>
      </SimpleGrid>

      <LocationsMap locations={locations} />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} size="lg" mb="md">
              Observations by Location
            </Text>
            <ScrollArea h={400} type="auto">
              <BarChart
                h={Math.max(300, observationChart.length * 30)}
                data={observationChart}
                dataKey="location"
                series={[{ name: "Observations", color: "blue.6" }]}
                orientation="horizontal"
                withTooltip
                withLegend={false}
              />
            </ScrollArea>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} size="lg" mb="md">
              Shannon Diversity Index by Location
            </Text>
            <ScrollArea h={400} type="auto">
              <BarChart
                h={Math.max(300, diversityChart.length * 30)}
                data={diversityChart}
                dataKey="location"
                series={[{ name: "Shannon Diversity", color: "grape.6" }]}
                orientation="horizontal"
                withTooltip
                withLegend={false}
              />
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Species Richness by Location
        </Text>
        <ScrollArea h={400} type="auto">
          <BarChart
            h={Math.max(300, speciesChart.length * 30)}
            data={speciesChart}
            dataKey="location"
            series={[{ name: "Species Count", color: "teal.6" }]}
            orientation="horizontal"
            withTooltip
            withLegend={false}
          />
        </ScrollArea>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Location Details
        </Text>
        <Stack gap="sm">
          {locations.map((loc) => (
            <Paper key={loc.locationName} p="sm" withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <ThemeIcon color="blue" variant="light" size="sm" radius="xl">
                    <IconMapPin size={12} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{loc.locationName}</Text>
                    {loc.zone && (
                      <Text size="xs" c="dimmed">
                        {loc.zone}
                        {loc.projectArea ? ` — ${loc.projectArea}` : ""}
                      </Text>
                    )}
                  </div>
                </Group>
                <Group gap="xs">
                  <Badge color="blue" variant="light" size="sm">
                    {loc.totalObservations} obs
                  </Badge>
                  <Badge color="green" variant="light" size="sm">
                    {loc.speciesCount} species
                  </Badge>
                  <Badge color="grape" variant="light" size="sm">
                    H&apos; = {loc.shannonDiversity}
                  </Badge>
                </Group>
              </Group>
              <Progress
                value={(loc.totalObservations / maxObs) * 100}
                size="sm"
                color="blue"
                radius="xl"
                mb="xs"
              />
              <Group gap="xs">
                {loc.topSpecies?.slice(0, 5).map((s) => (
                  <Badge key={s.name} size="xs" variant="dot">
                    {s.commonName || s.name}: {s.count}
                  </Badge>
                ))}
              </Group>
            </Paper>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  TextInput,
  NumberInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Text,
  Switch,
  ActionIcon,
  Table,
  Modal,
  Badge,
  FileInput,
  Image,
  LoadingOverlay,
  Title,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const ACHIEVEMENT_TYPES = ["MILESTONE", "BADGE", "RANK", "SPECIAL"];
const DOMAINS = [
  { value: "CAMERATRAP", label: "Camera Trap" },
  { value: "TRASH", label: "Trash" },
  { value: "WATER_QUALITY", label: "Water Quality" },
];

const CRITERIA_TYPES = {
  CAMERATRAP: [
    { value: "imagesReviewed", label: "Images Reviewed" },
    { value: "animalsObserved", label: "Animals Observed" },
    { value: "uniqueSpecies", label: "Unique Species" },
    { value: "consecutiveDays", label: "Consecutive Days" },
    { value: "blanksLogged", label: "Blanks Logged" },
    { value: "deploymentsReviewed", label: "Deployments Reviewed" },
    { value: "speciesConsensus", label: "Species Consensus" },
    { value: "expertVerified", label: "Expert Verified" },
    { value: "TOTAL_POINTS", label: "Total Domain Points" },
  ],
  TRASH: [
    { value: "itemsLogged", label: "Items Logged" },
    { value: "uniqueMaterials", label: "Unique Materials" },
    { value: "cleanupEvents", label: "Cleanup Events" },
    { value: "weightCollected", label: "Weight Collected" },
    { value: "locationsMonitored", label: "Locations Monitored" },
    { value: "dataQualityScore", label: "Data Quality Score" },
    { value: "sitesMonitored", label: "Sites Monitored" },
    { value: "TOTAL_POINTS", label: "Total Domain Points" },
  ],
  WATER_QUALITY: [
    { value: "samplesCollected", label: "Samples Collected" },
    { value: "parametersMeasured", label: "Parameters Measured" },
    { value: "sitesMonitored", label: "Sites Monitored" },
    { value: "qualityChecksPassed", label: "Quality Checks Passed" },
    { value: "consecutiveSampling", label: "Consecutive Sampling Days" },
    { value: "TOTAL_POINTS", label: "Total Domain Points" },
  ],
};

const OPERATORS = [
  { value: "gte", label: "Greater than or equal to" },
  { value: "lte", label: "Less than or equal to" },
  { value: "eq", label: "Equal to" },
];

const SUGGESTED_THRESHOLDS = {
  imagesReviewed: [10, 50, 100, 500, 1000],
  animalsObserved: [10, 50, 100, 500, 1000],
  uniqueSpecies: [5, 10, 25, 50, 100],
  consecutiveDays: [3, 7, 14, 30, 90],
  blanksLogged: [10, 50, 100, 500, 1000],
  deploymentsReviewed: [1, 5, 10, 25, 50],
  speciesConsensus: [5, 25, 50, 100, 500],
  expertVerified: [1, 5, 10, 25, 50],
  itemsLogged: [10, 50, 100, 500, 1000],
  uniqueMaterials: [3, 5, 10, 15, 20],
  cleanupEvents: [1, 5, 10, 25, 50],
  weightCollected: [1, 5, 10, 25, 50],
  locationsMonitored: [1, 3, 5, 10, 20],
  dataQualityScore: [70, 80, 90, 95, 100],
  sitesMonitored: [1, 3, 5, 10, 20],
  samplesCollected: [1, 5, 10, 25, 50],
  parametersMeasured: [1, 3, 5, 10, 15],
  qualityChecksPassed: [5, 10, 25, 50, 100],
  consecutiveSampling: [3, 7, 14, 30, 90],
  TOTAL_POINTS: [100, 250, 500, 1000, 2500],
};

export function AchievementManager() {
  const [achievements, setAchievements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState("CAMERATRAP");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    badge: "",
    level: 1,
    type: "MILESTONE",
    domain: "CAMERATRAP",
    points: 0,
    isActive: true,
    criteria: [
      {
        type: CRITERIA_TYPES[selectedDomain][0].value,
        threshold: 0,
        operator: "gte",
      },
    ],
  });
  const [uploadingBadge, setUploadingBadge] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/admin/achievements");
      if (!response.ok) throw new Error("Failed to fetch achievements");
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load achievements",
        color: "red",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAchievement
        ? `/api/admin/achievements/${editingAchievement._id}`
        : "/api/admin/achievements";

      const method = editingAchievement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save achievement");

      notifications.show({
        title: "Success",
        message: `Achievement ${
          editingAchievement ? "updated" : "created"
        } successfully`,
        color: "green",
      });

      setModalOpen(false);
      resetForm();
      fetchAchievements();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setFormData(achievement);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const response = await fetch(`/api/admin/achievements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete achievement");

      notifications.show({
        title: "Success",
        message: "Achievement deleted successfully",
        color: "green",
      });

      fetchAchievements();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      badge: "",
      level: 1,
      type: "MILESTONE",
      domain: selectedDomain,
      points: 0,
      isActive: true,
      criteria: [
        {
          type: CRITERIA_TYPES[selectedDomain][0].value,
          threshold: 0,
          operator: "gte",
        },
      ],
    });
    setEditingAchievement(null);
  };

  const addCriteria = () => {
    setFormData((prev) => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        {
          type: CRITERIA_TYPES[selectedDomain][0].value,
          threshold: 0,
          operator: "gte",
        },
      ],
    }));
  };

  const removeCriteria = (index) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }));
  };

  const updateCriteria = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleBadgeUpload = async (file) => {
    if (!file) return;

    setUploadingBadge(true);
    try {
      // Get presigned URL
      const presignedResponse = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          folder: "badges",
          contentType: file.type,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { url, fields } = await presignedResponse.json();

      // Create form data with all required fields
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("file", file);

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload badge");
      }

      // Get the final URL of the uploaded file
      const badgeUrl = `${url}${fields.key}`;

      // Update form data with the new badge URL
      setFormData((prev) => ({
        ...prev,
        badge: badgeUrl,
      }));

      notifications.show({
        title: "Success",
        message: "Badge uploaded successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    } finally {
      setUploadingBadge(false);
    }
  };

  const handleCriterionTypeChange = (index, value) => {
    updateCriteria(index, "type", value);
    // Suggest a threshold based on the criterion type
    const suggestedThresholds = SUGGESTED_THRESHOLDS[value];
    if (suggestedThresholds) {
      // For rank achievements, suggest higher thresholds
      const thresholdIndex = formData.type === "RANK" ? 4 : 0;
      updateCriteria(index, "threshold", suggestedThresholds[thresholdIndex]);
    }
  };

  const renderCriteriaForm = () => (
    <Stack spacing="md">
      {formData.criteria.map((criterion, index) => (
        <Group key={index} grow>
          <Select
            label="Criterion Type"
            data={CRITERIA_TYPES[formData.domain]}
            value={criterion.type}
            onChange={(value) => handleCriterionTypeChange(index, value)}
          />
          <Select
            label="Operator"
            data={OPERATORS}
            value={criterion.operator}
            onChange={(value) => updateCriteria(index, "operator", value)}
          />
          <NumberInput
            label="Threshold"
            value={criterion.threshold}
            onChange={(value) => updateCriteria(index, "threshold", value)}
            min={0}
          />
          {formData.criteria.length > 1 && (
            <ActionIcon
              color="red"
              onClick={() => removeCriteria(index)}
              style={{ marginTop: "auto" }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      ))}
      <Button variant="outline" onClick={addCriteria} fullWidth>
        {<IconPlus size={16} />}
        Add Criterion
      </Button>
    </Stack>
  );

  return (
    <Stack>
      <Group position="apart">
        <Title size="xl" weight={700}>
          Achievement Manager
        </Title>
        <Group>
          <Select
            label="Domain"
            data={DOMAINS}
            value={selectedDomain}
            onChange={(value) => {
              setSelectedDomain(value);
              setFormData((prev) => ({
                ...prev,
                domain: value,
                criteria: [
                  {
                    type: CRITERIA_TYPES[value][0].value,
                    threshold: 0,
                    operator: "gte",
                  },
                ],
              }));
            }}
          />
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            Add Achievement
          </Button>
        </Group>
      </Group>

      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Domain</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Level</Table.Th>
            <Table.Th>Points</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {achievements
            .filter((a) => a.domain === selectedDomain)
            .map((achievement) => (
              <Table.Tr key={achievement._id}>
                <Table.Td>
                  <Group>
                    <Image
                      src={achievement.badge}
                      alt={achievement.name}
                      width={40}
                      height={40}
                      style={{ marginRight: "10px" }}
                    />
                    {achievement.name}
                  </Group>
                </Table.Td>
                <Table.Td>{achievement.domain}</Table.Td>
                <Table.Td>{achievement.type}</Table.Td>
                <Table.Td>{achievement.level}</Table.Td>
                <Table.Td>{achievement.points}</Table.Td>
                <Table.Td>
                  <Badge color={achievement.isActive ? "green" : "gray"}>
                    {achievement.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group spacing={4}>
                    <ActionIcon onClick={() => handleEdit(achievement)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDelete(achievement._id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingAchievement ? "Edit Achievement" : "New Achievement"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextInput
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Group grow>
              <TextInput
                label="Icon (emoji)"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />

              <div style={{ position: "relative" }}>
                <LoadingOverlay visible={uploadingBadge} />
                <FileInput
                  label="Badge Image"
                  placeholder="Upload badge image"
                  accept="image/*"
                  onChange={handleBadgeUpload}
                  description={
                    formData.badge && (
                      <Text size="xs" color="dimmed" component="span">
                        Current: {formData.badge.split("/").pop()}
                      </Text>
                    )
                  }
                  disabled={uploadingBadge}
                />
              </div>

              {formData.badge && (
                <Card withBorder p="xs">
                  <Group position="apart">
                    <Image
                      src={formData.badge}
                      alt="Badge preview"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        objectFit: "contain",
                      }}
                    />
                    <ActionIcon
                      color="red"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, badge: "" }))
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              )}
            </Group>
            <Group grow>
              <Select
                label="Type"
                data={ACHIEVEMENT_TYPES}
                value={formData.type}
                onChange={(value) => {
                  setFormData({ ...formData, type: value });
                  // Update thresholds for all criteria if changing to/from RANK
                  formData.criteria.forEach((_, index) => {
                    const suggestedThresholds =
                      SUGGESTED_THRESHOLDS[formData.criteria[index].type];
                    if (suggestedThresholds) {
                      const thresholdIndex = value === "RANK" ? 4 : 0;
                      updateCriteria(
                        index,
                        "threshold",
                        suggestedThresholds[thresholdIndex]
                      );
                    }
                  });
                }}
              />
              <NumberInput
                label="Level"
                value={formData.level}
                onChange={(value) => setFormData({ ...formData, level: value })}
                min={1}
              />
              <NumberInput
                label="Points"
                value={formData.points}
                onChange={(value) =>
                  setFormData({ ...formData, points: value })
                }
                min={0}
              />
            </Group>
            <Switch
              label="Active"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.currentTarget.checked })
              }
            />
            {renderCriteriaForm()}
            <Group position="right">
              <Button type="submit">
                {editingAchievement ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

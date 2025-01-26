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
    { value: "IMAGES_REVIEWED", label: "Images Reviewed" },
    { value: "ANIMALS_OBSERVED", label: "Animals Observed" },
    { value: "UNIQUE_SPECIES", label: "Unique Species" },
    { value: "CONSECUTIVE_DAYS", label: "Consecutive Days" },
    { value: "BLANKS_LOGGED", label: "Blanks Logged" },
    { value: "DEPLOYMENTS_REVIEWED", label: "Deployments Reviewed" },
    { value: "SPECIES_CONSENSUS", label: "Species Consensus" },
    { value: "EXPERT_VERIFIED", label: "Expert Verified" },
  ],
  TRASH: [
    { value: "ITEMS_LOGGED", label: "Items Logged" },
    { value: "UNIQUE_MATERIALS", label: "Unique Materials" },
    { value: "CLEANUP_EVENTS", label: "Cleanup Events" },
    { value: "WEIGHT_COLLECTED", label: "Weight Collected" },
    { value: "LOCATIONS_MONITORED", label: "Locations Monitored" },
    { value: "DATA_QUALITY_SCORE", label: "Data Quality Score" },
  ],
  WATER_QUALITY: [
    { value: "SAMPLES_COLLECTED", label: "Samples Collected" },
    { value: "PARAMETERS_MEASURED", label: "Parameters Measured" },
    { value: "SITES_MONITORED", label: "Sites Monitored" },
    { value: "QUALITY_CHECKS_PASSED", label: "Quality Checks Passed" },
    { value: "CONSECUTIVE_SAMPLING", label: "Consecutive Sampling Days" },
  ],
};

const OPERATORS = [
  { value: "gte", label: "Greater than or equal to" },
  { value: "lte", label: "Less than or equal to" },
  { value: "eq", label: "Equal to" },
];

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

  return (
    <Stack>
      <Group position="apart">
        <Text size="xl" weight={700}>
          Achievement Manager
        </Text>
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

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Type</th>
            <th>Level</th>
            <th>Points</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {achievements
            .filter((a) => a.domain === selectedDomain)
            .map((achievement) => (
              <tr key={achievement._id}>
                <td>{achievement.name}</td>
                <td>{achievement.domain}</td>
                <td>{achievement.type}</td>
                <td>{achievement.level}</td>
                <td>{achievement.points}</td>
                <td>
                  <Badge color={achievement.isActive ? "green" : "gray"}>
                    {achievement.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
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
                </td>
              </tr>
            ))}
        </tbody>
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
            </Group>

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

            <Group grow>
              <NumberInput
                label="Level"
                required
                min={1}
                value={formData.level}
                onChange={(value) => setFormData({ ...formData, level: value })}
              />

              <NumberInput
                label="Points"
                required
                min={0}
                value={formData.points}
                onChange={(value) =>
                  setFormData({ ...formData, points: value })
                }
              />
            </Group>

            <Select
              label="Type"
              required
              data={ACHIEVEMENT_TYPES}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
            />

            <Select
              label="Domain"
              required
              data={DOMAINS}
              value={formData.domain}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  domain: value,
                  criteria: [
                    {
                      type: CRITERIA_TYPES[value][0].value,
                      threshold: 0,
                      operator: "gte",
                    },
                  ],
                });
              }}
            />

            <Switch
              label="Active"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.currentTarget.checked })
              }
            />

            <Stack spacing="xs">
              <Group position="apart">
                <Text size="sm" weight={500}>
                  Criteria
                </Text>
                <Button size="xs" onClick={addCriteria}>
                  Add Criteria
                </Button>
              </Group>

              {formData.criteria.map((criterion, index) => (
                <Card key={index} withBorder p="xs">
                  <Group grow>
                    <Select
                      size="xs"
                      label="Type"
                      data={CRITERIA_TYPES[formData.domain]}
                      value={criterion.type}
                      onChange={(value) => updateCriteria(index, "type", value)}
                    />

                    <NumberInput
                      size="xs"
                      label="Threshold"
                      value={criterion.threshold}
                      onChange={(value) =>
                        updateCriteria(index, "threshold", value)
                      }
                    />

                    <Select
                      size="xs"
                      label="Operator"
                      data={OPERATORS}
                      value={criterion.operator}
                      onChange={(value) =>
                        updateCriteria(index, "operator", value)
                      }
                    />

                    <ActionIcon
                      color="red"
                      onClick={() => removeCriteria(index)}
                      disabled={formData.criteria.length === 1}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>

            <Group position="right">
              <Button
                variant="subtle"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAchievement ? "Update" : "Create"} Achievement
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

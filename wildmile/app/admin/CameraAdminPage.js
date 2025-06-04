"use client";
import { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Table,
  Container,
  Group,
  LoadingOverlay,
  Title,
  Text,
  Badge,
  Menu,
  ActionIcon,
} from "@mantine/core";
import { IconDots, IconPlus, IconMinus } from "@tabler/icons-react";

// Role configuration for UI display
const ROLE_CONFIG = {
  SuperAdmin: {
    addLabel: "Add Super Admin",
    removeLabel: "Remove Super Admin",
    color: "red",
    description: "Full system access",
  },
  Admin: {
    addLabel: "Add Admin",
    removeLabel: "Remove Admin",
    color: "grape",
    description: "System-wide management",
  },
  CameraAdmin: {
    addLabel: "Add Camera Admin",
    removeLabel: "Remove Camera Admin",
    color: "violet",
    description: "Camera system management",
  },
  CameraManager: {
    addLabel: "Add Camera Manager",
    removeLabel: "Remove Camera Manager",
    color: "blue",
    description: "Camera operations",
  },
  PlantAdmin: {
    addLabel: "Add Plant Admin",
    removeLabel: "Remove Plant Admin",
    color: "teal",
    description: "Plant system management",
  },
  PlantManager: {
    addLabel: "Add Plant Manager",
    removeLabel: "Remove Plant Manager",
    color: "green",
    description: "Plant operations",
  },
};

export default function CameraAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    canManage: Object.keys(ROLE_CONFIG),
    canView: Object.keys(ROLE_CONFIG),
  });

  // Fetch initial permissions and users with roles
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch permissions
        const permResponse = await fetch("/api/admin/update-user-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "test",
            role: "CameraManager",
            action: "add",
          }),
        });

        if (permResponse.ok) {
          const data = await permResponse.json();
          if (data.permissions) {
            setUserPermissions(data.permissions);
          }
        }

        // Fetch users with roles
        const usersResponse = await fetch(
          "/api/admin/find-users?hasRoles=true"
        );
        if (usersResponse.ok) {
          const result = await usersResponse.json();
          setUsers(result);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/find-users${
          searchTerm
            ? `?searchTerm=${encodeURIComponent(searchTerm)}`
            : "?hasRoles=true"
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      setUsers(result);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleRoleChange = async (userId, role, action) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/update-user-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      const result = await response.json();

      // Update the user in the list
      setUsers((users) =>
        users.map((user) => (user._id === userId ? result.user : user))
      );

      // Update permissions if they changed
      if (result.permissions) {
        setUserPermissions(result.permissions);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleActions = (user) => {
    const availableRoles = userPermissions.canManage.includes("SuperAdmin")
      ? Object.keys(ROLE_CONFIG)
      : userPermissions.canManage;

    if (availableRoles.length === 0) return null;

    return (
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" size="sm">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Manage Roles</Menu.Label>
          {availableRoles.map((role) => {
            const config = ROLE_CONFIG[role];
            const hasRole = user.roles?.includes(role);

            return (
              <Menu.Item
                key={role}
                color={config.color}
                leftSection={
                  hasRole ? <IconMinus size={14} /> : <IconPlus size={14} />
                }
                onClick={() =>
                  handleRoleChange(user._id, role, hasRole ? "remove" : "add")
                }
              >
                {hasRole ? config.removeLabel : config.addLabel}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    );
  };

  const renderRoleBadges = (roles) => {
    return roles.map((role) => {
      const config = ROLE_CONFIG[role];
      return config ? (
        <Badge
          key={role}
          color={config.color}
          title={config.description}
          variant="light"
        >
          {role}
        </Badge>
      ) : null;
    });
  };

  return (
    <Container size="xl">
      <LoadingOverlay visible={loading} />
      <Title order={2} mb="md">
        User Role Management
      </Title>
      <Group mb="xl">
        <TextInput
          placeholder="Search by name or email (leave empty to show all users with roles)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
      </Group>

      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Current Roles</Table.Th>
            <Table.Th style={{ width: 40 }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user._id}>
              <Table.Td>{user.profile?.name || "N/A"}</Table.Td>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="wrap">
                  {renderRoleBadges(user.roles || [])}
                </Group>
              </Table.Td>
              <Table.Td>{renderRoleActions(user)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {users.length === 0 && (
        <Text c="dimmed" ta="center" mt="md">
          No users found
        </Text>
      )}
    </Container>
  );
}

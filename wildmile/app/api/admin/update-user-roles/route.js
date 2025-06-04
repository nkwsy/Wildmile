import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import User from "models/User";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

// Define role hierarchies and permissions
const ROLE_HIERARCHY = {
  SuperAdmin: {
    canManage: [
      "Admin",
      "CameraAdmin",
      "PlantAdmin",
      "CameraManager",
      "PlantManager",
    ],
    description: "Can manage all roles",
  },
  Admin: {
    canManage: ["CameraAdmin", "PlantAdmin", "CameraManager", "PlantManager"],
    description: "Can manage all domain-specific roles",
  },
  CameraAdmin: {
    canManage: ["CameraManager", "CameraAdmin"],
    canView: ["CameraManager", "CameraAdmin"],
    domain: "camera",
    description: "Can manage camera-related roles",
  },
  PlantAdmin: {
    canManage: ["PlantManager", "PlantAdmin"],
    canView: ["PlantManager", "PlantAdmin"],
    domain: "plant",
    description: "Can manage plant-related roles",
  },
  CameraManager: {
    canView: ["CameraManager", "CameraAdmin"],
    domain: "camera",
    description: "Can view camera-related roles",
  },
  PlantManager: {
    canView: ["PlantManager", "PlantAdmin"],
    domain: "plant",
    description: "Can view plant-related roles",
  },
};

// Helper function to check if a user can manage a specific role
function canManageRole(userRoles, targetRole) {
  // SuperAdmin can manage everything
  if (userRoles.includes("SuperAdmin")) return true;

  // Check each of the user's roles for management permissions
  return userRoles.some((userRole) => {
    const rolePerms = ROLE_HIERARCHY[userRole];
    return rolePerms?.canManage?.includes(targetRole);
  });
}

// Helper function to validate domain access
function hasDomainAccess(userRoles, targetRole) {
  const targetDomain = ROLE_HIERARCHY[targetRole]?.domain;
  if (!targetDomain) return true; // No domain restriction

  return userRoles.some(
    (userRole) =>
      ROLE_HIERARCHY[userRole]?.domain === targetDomain ||
      ROLE_HIERARCHY[userRole]?.canManage?.includes(targetRole)
  );
}

export async function POST(request) {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, role, action } = await request.json();

    if (!userId || !role || !action) {
      return NextResponse.json(
        { message: "User ID, role, and action are required" },
        { status: 400 }
      );
    }

    // Validate the role exists
    if (!ROLE_HIERARCHY[role]) {
      return NextResponse.json(
        { message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Check if user has permission to manage this role
    const userRoles = session.roles || [];
    if (!canManageRole(userRoles, role)) {
      return NextResponse.json(
        { message: "You don't have permission to manage this role" },
        { status: 403 }
      );
    }

    // Check domain-specific access
    if (!hasDomainAccess(userRoles, role)) {
      return NextResponse.json(
        { message: "You don't have access to this domain" },
        { status: 403 }
      );
    }

    // Perform the update
    const update =
      action === "add"
        ? { $addToSet: { roles: role } }
        : { $pull: { roles: role } };

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("email profile.name roles");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
      permissions: {
        canManage: userRoles.flatMap(
          (role) => ROLE_HIERARCHY[role]?.canManage || []
        ),
        canView: userRoles.flatMap(
          (role) => ROLE_HIERARCHY[role]?.canView || []
        ),
      },
    });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update user roles" },
      { status: 500 }
    );
  }
}

// Export helper functions for reuse in other parts of the application
export const roleUtils = {
  ROLE_HIERARCHY,
  canManageRole,
  hasDomainAccess,
};

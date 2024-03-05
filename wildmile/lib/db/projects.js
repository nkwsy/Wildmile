import Project from "models/Project";
import Section from "/models/Section";

// PROJECTS
export async function createProject(req) {
  const { name, description, notes, decommisioned } = req.body;
  const project = await Project.create({
    name,
    description,
    notes,
    decommisioned: false,
  });
  return res.status(201).json({ success: true, data: project });
}

// SECTIONS

export async function createSection(req) {
  if (!req.body) {
    throw new Error(
      "Request body is missing or does not contain an items property"
    );
  }
  const { name, description, dateInstalled, notes, size, projectId } = req.body;
  try {
    const section = await Section.create({
      name,
      description,
      dateInstalled,
      notes,
      size,
      projectId,
    });
    console.log("createSection Section:", section);
    return section;
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
}

// MODULES

"use server";
import "server-only";

// import auth from "/middleware/auth";
import {
  getAllLogs,
  createLog,
  getFilteredLogs,
  createSection,
  createProject,
  getModules,
  getModulesToDraw,
} from "/lib/db/projects";

export async function GET(req, { params }) {
  console.log("GET /api/project/", req.body, params);
  const modules = await getModulesToDraw(params.section);
  if (req.query) {
    return res.json(modules);
  }
  return res.json({});
}

// export async function GET() {
//     const res = await fetch('https://data.mongodb-api.com/...', {
//       headers: {
//         'Content-Type': 'application/json',
//         'API-Key': process.env.DATA_API_KEY,
//       },
//     })
//     const data = await res.json()

//     return Response.json({ data })
//   }

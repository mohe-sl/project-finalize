import express from "express";
import mongoose from "mongoose";
import ProjectProgress from "../models/ProjectProgress.js";
import Project from "../models/Project.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ Create Progress Entry
router.post("/", upload.fields([
  { name: 'physicalProgressImage1', maxCount: 1 },
  { name: 'physicalProgressImage2', maxCount: 1 },
  { name: 'physicalProgressImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = { ...req.body };

    // Add image file paths if they were uploaded
    if (req.files) {
      if (req.files.physicalProgressImage1) {
        data.physicalProgressImage1 = req.files.physicalProgressImage1[0].filename;
      }
      if (req.files.physicalProgressImage2) {
        data.physicalProgressImage2 = req.files.physicalProgressImage2[0].filename;
      }
      if (req.files.physicalProgressImage3) {
        data.physicalProgressImage3 = req.files.physicalProgressImage3[0].filename;
      }
    }

    // Resolve projectId: accept either an ObjectId string or a projectName
    let resolvedProjectId = data.projectId;
    if (!resolvedProjectId) {
      return res.status(400).json({ error: "projectId is required (provide ObjectId or existing projectName)" });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedProjectId)) {
      // Try to find a Project by projectName
      const found = await Project.findOne({ projectName: String(resolvedProjectId) });
      if (found) {
        resolvedProjectId = found._id;
      } else {
        return res.status(400).json({ error: "projectId is not a valid ObjectId and no project with that name was found. Provide a valid project _id or an existing projectName." });
      }
    }

    data.projectId = resolvedProjectId;
    const progress = new ProjectProgress(data);
    await progress.save();
    res.status(201).json(progress);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get All Progress Entries (supports filtering by query params)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    // Allow filtering by other fields if needed, e.g. projectId
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    const progressList = await ProjectProgress.find(filter).populate("projectId");
    res.json(progressList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Progress by Project ID OR Get single Progress by its own _id
router.get('/:projectId', async (req, res) => {
  try {
    const param = req.params.projectId;

    // If the param looks like an ObjectId, first attempt to find a progress entry by _id.
    // If not found, fall back to returning all entries that match projectId (this handles
    // the common case where projectId is also an ObjectId).
    if (mongoose.Types.ObjectId.isValid(param)) {
      const entry = await ProjectProgress.findById(param).populate('projectId');
      if (entry) return res.json(entry);

      // No progress found by this _id — try treating param as a projectId and return all entries
      const progressByProject = await ProjectProgress.find({ projectId: param }).populate('projectId');
      return res.json(progressByProject);
    }

    // Otherwise treat it as a projectId (string) and return all progress entries for that project
    const progress = await ProjectProgress.find({ projectId: param }).populate('projectId');
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Progress
router.put("/:id", async (req, res) => {
  try {
    const updated = await ProjectProgress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Patch Progress (for draft saves with file support)
router.patch("/:id", upload.fields([
  { name: 'physicalProgressImage1', maxCount: 1 },
  { name: 'physicalProgressImage2', maxCount: 1 },
  { name: 'physicalProgressImage3', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = { ...req.body };

    // Update image file paths if they were uploaded
    if (req.files) {
      if (req.files.physicalProgressImage1) {
        data.physicalProgressImage1 = req.files.physicalProgressImage1[0].filename;
      }
      if (req.files.physicalProgressImage2) {
        data.physicalProgressImage2 = req.files.physicalProgressImage2[0].filename;
      }
      if (req.files.physicalProgressImage3) {
        data.physicalProgressImage3 = req.files.physicalProgressImage3[0].filename;
      }
    }

    const updated = await ProjectProgress.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete Progress
router.delete("/:id", async (req, res) => {
  try {
    await ProjectProgress.findByIdAndDelete(req.params.id);
    res.json({ message: "Progress deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

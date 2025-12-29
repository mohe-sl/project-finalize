import express from "express";
import Project from "../models/Project.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// (assign-institution endpoints removed)

// ✅ Create Project with image upload
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    // Convert string numbers to actual numbers
    if (req.body.budget) projectData.budget = Number(req.body.budget);
    if (req.body.fundingScore) projectData.fundingScore = Number(req.body.fundingScore);

    // attach creator
    projectData.createdBy = req.user ? req.user._id : null;
    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get All Projects
// Get All Projects - admins see all, others see only their own
router.get("/", protect, async (req, res) => {
  try {
    if (req.user && req.user.roleId === 'admin') {
      const projects = await Project.find();
      return res.json(projects);
    }

    // For non-admin users, return projects they created OR projects that belong to their institution
    const userInstitution = req.user && req.user.institutionId ? req.user.institutionId : null;
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        ...(userInstitution ? [{ institution: userInstitution }] : [])
      ]
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Project by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // allow if admin, owner, or same institution
    const userInstitution = req.user && req.user.institutionId ? req.user.institutionId : null;
    const isOwner = project.createdBy && project.createdBy.equals(req.user._id);
    const isSameInstitution = userInstitution && project.institution && String(project.institution) === String(userInstitution);
    if (req.user.roleId !== 'admin' && !isOwner && !isSameInstitution) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update Project
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Add image path if new image was uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Convert string numbers to actual numbers
    if (req.body.budget) updateData.budget = Number(req.body.budget);
    if (req.body.fundingScore) updateData.fundingScore = Number(req.body.fundingScore);

    // ownership check
    const existing = await Project.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    if (req.user.roleId !== 'admin' && existing.createdBy && !existing.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete Project
router.delete("/:id", protect, async (req, res) => {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    if (req.user.roleId !== 'admin' && existing.createdBy && !existing.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

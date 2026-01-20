import express from "express";
import Project from "../models/Project.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// (assign-institution endpoints removed)

// ✅ Create Project with image upload
const uploadFields = upload.fields([
  { name: 'projectImage', maxCount: 1 },
  { name: 'projectPDF', maxCount: 1 },
  { name: 'extensionPDF', maxCount: 1 },
  // Keeping 'image' for backward compatibility if needed, though form sends 'projectImage' now
  { name: 'image', maxCount: 1 }
]);

router.post("/", protect, uploadFields, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.projectImage) projectData.projectImage = `/uploads/${req.files.projectImage[0].filename}`;
      if (req.files.projectPDF) projectData.projectPDF = `/uploads/${req.files.projectPDF[0].filename}`;
      if (req.files.extensionPDF) projectData.extensionPDF = `/uploads/${req.files.extensionPDF[0].filename}`;
      if (req.files.image) projectData.image = `/uploads/${req.files.image[0].filename}`; // legacy
    }

    // Clean up empty strings for numbers and dates to avoid CastErrors
    ['tec', 'awardedAmount', 'budget', 'fundingScore'].forEach(field => {
      if (req.body[field] === "") delete projectData[field];
      else if (req.body[field]) projectData[field] = Number(req.body[field]);
    });

    ['durationStart', 'durationEnd', 'returnPeriodsStart', 'returnPeriodsEnd',
      'startDate', 'estimatedEndDate', 'extendedDate', 'revisedDate', 'npdDate',
      'cabinetPapersDate', 'endDate'].forEach(field => {
        if (req.body[field] === "") delete projectData[field];
      });

    // attach creator
    projectData.createdBy = req.user ? req.user._id : null;
    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
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
router.put("/:id", protect, uploadFields, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Add image paths if new files were uploaded
    if (req.files) {
      if (req.files.projectImage) updateData.projectImage = `/uploads/${req.files.projectImage[0].filename}`;
      if (req.files.projectPDF) updateData.projectPDF = `/uploads/${req.files.projectPDF[0].filename}`;
      if (req.files.extensionPDF) updateData.extensionPDF = `/uploads/${req.files.extensionPDF[0].filename}`;
      if (req.files.image) updateData.image = `/uploads/${req.files.image[0].filename}`;
    }

    // Clean up empty strings for numbers and dates
    ['tec', 'awardedAmount', 'budget', 'fundingScore'].forEach(field => {
      if (req.body[field] === "") delete updateData[field];
      else if (req.body[field]) updateData[field] = Number(req.body[field]);
    });

    ['durationStart', 'durationEnd', 'returnPeriodsStart', 'returnPeriodsEnd',
      'startDate', 'estimatedEndDate', 'extendedDate', 'revisedDate', 'npdDate',
      'cabinetPapersDate', 'endDate'].forEach(field => {
        if (req.body[field] === "") delete updateData[field];
      });

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
    console.error("Error updating project:", err);
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

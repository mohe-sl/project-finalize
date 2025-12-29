import React, { useEffect, useRef, useState } from "react";

/**
 * ProjectImageView.jsx
 * - Hardcoded projects array (each project has 3 images)
 * - Card grid with small autoplay preview
 * - Modal with full carousel and project details (See more)
 *
 * Requires TailwindCSS in your project.
 */

const projectsData = [
  {
    id: "PJT-001",
    title: "Community Library Renovation",
    location: "Colombo",
    status: "In Progress",
    progressPercent: 62,
    budget: "$120,000",
    brief:
      "Renovation of the central community library including new roofing, electrical, and accessibility upgrades.",
    images: [
      "https://images.unsplash.com/photo-1523475496153-3d6cc8f0f78d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7c6ae8f0e2b5a1c8d4e6f1b8a9d3f2c3",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2e7ca82a2500f2a9bdd7f9c8e5d5b6a8",
      "https://images.unsplash.com/photo-1505691723518-36a4b4531a4a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=5a3b9f6b24f7c7b8fcb7a2b8d85ef6c2",
    ],
  },
  {
    id: "PJT-002",
    title: "Rural Clinic Build",
    location: "Kandy",
    status: "Planned",
    progressPercent: 12,
    budget: "$85,000",
    brief:
      "Construction of a rural primary health clinic with sanitation facilities and patient waiting area.",
    images: [
      "https://images.unsplash.com/photo-1519821172141-bd9d6b5f0d8c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=ccf2c7a7fe5b9a4f8f5e2b2da9c3cd34",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3b5b8c7a6c9f4f1a7e8a2c3d4b5e6f1c",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9f3a8ab6d7a1b0c5d6f8a2c7b3e1f4a0",
    ],
  },
  {
    id: "PJT-003",
    title: "School Play Ground Upgrade",
    location: "Galle",
    status: "Completed",
    progressPercent: 100,
    budget: "$40,000",
    brief:
      "Upgrading playground equipment, safety surfacing and perimeter fencing for local primary school.",
    images: [
      "https://images.unsplash.com/photo-1509099836639-18ba3b6c3c54?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=0c3c8a1f6d7b3f2e5a6c4d1b2e3f9a7b",
      "https://images.unsplash.com/photo-1520975698519-6fa6da1b9b5d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7c9a6a1b2d3e4f5a6b7c8d9e0f1a2b3c",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6d1f9a8b7c4e2d1a9f8b6c5a3d2e1f0a",
    ],
  },
  
  {
    id: "PJT-001",
    title: "Community Library Renovation",
    location: "Colombo",
    status: "In Progress",
    progressPercent: 62,
    budget: "$120,000",
    brief:
      "Renovation of the central community library including new roofing, electrical, and accessibility upgrades.",
    images: [
      "https://images.unsplash.com/photo-1523475496153-3d6cc8f0f78d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691723518-36a4b4531a4a?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "PJT-002",
    title: "Rural Clinic Build",
    location: "Kandy",
    status: "Planned",
    progressPercent: 12,
    budget: "$85,000",
    brief:
      "Construction of a rural primary health clinic with sanitation facilities and patient waiting area.",
    images: [
      "https://images.unsplash.com/photo-1519821172141-bd9d6b5f0d8c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "PJT-003",
    title: "School Playground Upgrade",
    location: "Galle",
    status: "Completed",
    progressPercent: 100,
    budget: "$40,000",
    brief:
      "Upgrading playground equipment, safety surfacing and perimeter fencing for local primary school.",
    images: [
      "https://images.unsplash.com/photo-1509099836639-18ba3b6c3c54?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975698519-6fa6da1b9b5d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  // New Projects for 6 cards
  {
    id: "PJT-004",
    title: "City Park Expansion",
    location: "Matara",
    status: "In Progress",
    progressPercent: 55,
    budget: "$95,000",
    brief:
      "Expanding city park area with walking trails, playgrounds, and garden landscaping.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516466723877-725ff1b4c2d1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "PJT-005",
    title: "University Lab Upgrade",
    location: "Jaffna",
    status: "Planned",
    progressPercent: 20,
    budget: "$150,000",
    brief:
      "Modernization of laboratory facilities including new equipment and safety improvements.",
    images: [
      "https://images.unsplash.com/photo-1581090700227-94f73d45b7a2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573496776630-6cf8113db7ee?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573164574232-2f28c4a1640b?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "PJT-006",
    title: "Town Road Rehabilitation",
    location: "Negombo",
    status: "Completed",
    progressPercent: 100,
    budget: "$250,000",
    brief:
      "Complete road rehabilitation including paving, drainage, and pedestrian sidewalks.",
    images: [
      "https://images.unsplash.com/photo-1535083788299-8e3fae7b1c8d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544025162-0c3d9a1b6c2f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533271578755-170d9d7f19da?q=80&w=1200&auto=format&fit=crop",
    ],
  },

];

const SmallSlide = ({ images, interval = 2500 }) => {
  const [i, setI] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % images.length);
    }, interval);
    return () => {
      mounted.current = false;
      clearInterval(t);
    };
  }, [images, interval]);

  return (
    <div className="w-full h-40 md:h-44 rounded-lg overflow-hidden bg-gray-100">
      <img
        src={images[i]}
        alt={`preview-${i}`}
        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
      />
    </div>
  );
};

const ModalCarousel = ({ project, onClose }) => {
  const { images } = project;
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef(null);

  useEffect(() => {
    // autoplay in modal
    autoplayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setIndex((prev) => (prev - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((prev) => (prev + 1) % images.length);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(autoplayRef.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [images.length, onClose]);

  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setIndex((prev) => (prev + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden">
        <div className="flex items-start md:items-center gap-4 md:gap-8 p-4 md:p-6">
          {/* Carousel */}
          <div className="flex-1">
            <div className="relative">
              <img
                src={images[index]}
                alt={`slide-${index}`}
                className="w-full h-96 object-cover rounded-lg"
              />
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                aria-label="previous"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                aria-label="next"
              >
                ›
              </button>
            </div>

            {/* thumbnails */}
            <div className="flex gap-3 mt-3">
              {images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setIndex(idx)}
                  className={`w-20 h-12 rounded-md overflow-hidden border ${
                    idx === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-80 p-2 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{project.title}</h3>
                <p className="text-sm text-gray-500">{project.location} • {project.id}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 ml-4"
                aria-label="close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {project.status}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 text-sm">{project.brief}</p>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-700"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
              <div className="mt-2 text-sm font-medium text-gray-700">{project.progressPercent}% complete</div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-gray-600">Budget</div>
              <div className="mt-1 font-semibold">{project.budget}</div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => alert(`Opening full project page for ${project.id}...`)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Open Project
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onSeeMore }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="p-4">
        <SmallSlide images={project.images} />
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold">{project.title}</h4>
            <p className="text-sm text-gray-500">{project.location} • {project.id}</p>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.brief}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <div className="text-xs text-gray-500">Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold">{project.progressPercent}%</div>
            <div className="text-xs text-gray-500">{project.status}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => onSeeMore(project)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition"
          >
            See more
          </button>
          <button
            onClick={() => alert(`Quick view opened for ${project.id}`)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
          >
            View Project
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectImageView = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Projects Gallery</h1>
        <p className="text-sm text-gray-600">Latest project images and current snapshot details.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsData.map((p) => (
          <ProjectCard key={p.id} project={p} onSeeMore={(proj) => setSelected(proj)} />
        ))}
      </div>

      {/* Modal */}
      {selected && <ModalCarousel project={selected} onClose={() => setSelected(null)} />}
    </div>

    
  );
};

export default ProjectImageView;

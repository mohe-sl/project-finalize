import React, { useState } from "react";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const MonthlyImageUploader = ({ projectId, userName }) => {
  const [uploads, setUploads] = useState(
    Array.from({ length: 12 }, () => ({
      images: [], // array of { file, preview }
      progressName: "",
      uploaded: false,
      editMode: false,
    }))
  );

  const handleFileChange = (monthIndex, fileIndex, file) => {
    const newUploads = [...uploads];
    newUploads[monthIndex].images[fileIndex] = {
      file,
      preview: URL.createObjectURL(file),
    };
    setUploads(newUploads);
  };

  const handleAddImage = (monthIndex) => {
    const newUploads = [...uploads];
    newUploads[monthIndex].images.push({ file: null, preview: null });
    setUploads(newUploads);
  };

  const handleRemoveImage = (monthIndex, imgIndex) => {
    const newUploads = [...uploads];
    newUploads[monthIndex].images.splice(imgIndex, 1);
    setUploads(newUploads);
  };

  const handleProgressChange = (monthIndex, value) => {
    const newUploads = [...uploads];
    newUploads[monthIndex].progressName = value;
    setUploads(newUploads);
  };

  const handleSubmit = async (monthIndex) => {
    const entry = uploads[monthIndex];
    if (entry.images.length === 0 || entry.images.every(img => img.file === null)) {
      return alert("Please add at least one image!");
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("userName", userName);
    formData.append("month", monthIndex + 1);
    formData.append("progressName", entry.progressName);
    entry.images.forEach((imgObj) => {
      if (imgObj.file) formData.append("images", imgObj.file);
    });

    try {
      await fetch("/api/upload-monthly-image", {
        method: "POST",
        body: formData,
      });

      const newUploads = [...uploads];
      newUploads[monthIndex].uploaded = true;
      newUploads[monthIndex].editMode = false;
      setUploads(newUploads);
      alert(`${months[monthIndex]} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const handleEdit = (monthIndex) => {
    const newUploads = [...uploads];
    newUploads[monthIndex].editMode = true;
    setUploads(newUploads);
  };

  const handleSaveChanges = async (monthIndex) => {
    await handleSubmit(monthIndex); // Reuse submit logic for save
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">📊 Monthly Progress</h2>

      {months.map((month, monthIndex) => {
        const { images, progressName, uploaded, editMode } = uploads[monthIndex];

        return (
          <div
            key={month}
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-4 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div className="text-blue-900 font-semibold text-lg">{month}</div>
              {!uploaded || editMode ? (
                <button
                  onClick={() => handleAddImage(monthIndex)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  + Add Image
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4">
              {images.map((imgObj, imgIndex) => (
                <div key={imgIndex} className="relative">
                  {(editMode || !uploaded) && (
                    <>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(monthIndex, imgIndex, e.target.files[0])}
                        className="hidden"
                        id={`file-${monthIndex}-${imgIndex}`}
                      />
                      <label
                        htmlFor={`file-${monthIndex}-${imgIndex}`}
                        className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer bg-gray-50"
                      >
                        {imgObj.preview ? (
                          <img src={imgObj.preview} alt="preview" className="h-28 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400 text-center text-sm">Click to upload</span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(monthIndex, imgIndex)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </>
                  )}
                  {!editMode && uploaded && imgObj.preview && (
                    <img src={imgObj.preview} alt="uploaded" className="w-32 h-32 object-cover rounded" />
                  )}
                </div>
              ))}
            </div>

            <input
              type="text"
              value={progressName}
              onChange={(e) => handleProgressChange(monthIndex, e.target.value)}
              placeholder="Enter progress name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={!editMode && uploaded}
            />

            <div className="flex gap-2">
              {!uploaded && !editMode ? (
                <button
                  onClick={() => handleSubmit(monthIndex)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              ) : editMode ? (
                <button
                  onClick={() => handleSaveChanges(monthIndex)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => handleEdit(monthIndex)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthlyImageUploader;

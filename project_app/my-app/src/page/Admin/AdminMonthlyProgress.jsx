import React, { useState, useEffect } from "react";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// Hardcoded example data for admin view
const exampleData = [
  {
    userName: "John Doe",
    projectId: "P-001",
    monthlyUploads: Array(12).fill(null).map((_, i) => ({
      progressName: `Progress ${i + 1}`,
      imageUrl: null,
      uploaded: false,
    })),
  },
  {
    userName: "Jane Smith",
    projectId: "P-002",
    monthlyUploads: Array(12).fill(null).map((_, i) => ({
      progressName: `Progress ${i + 1}`,
      imageUrl: null,
      uploaded: false,
    })),
  },
];

const AdminMonthlyProgress = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch from backend API in real use
    setData(exampleData);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Monthly Progress Overview</h1>

      {data.map((user, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-md p-4 space-y-4"
        >
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h2 className="font-semibold">{user.userName}</h2>
              <p className="text-gray-500 text-sm">Project ID: {user.projectId}</p>
            </div>
            <div className="text-sm font-medium text-blue-600">
              Total Months: {user.monthlyUploads.filter(m => m.uploaded).length}/12
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.monthlyUploads.map((month, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow hover:shadow-lg transition"
              >
                <div className="font-semibold mb-2">{months[index]}</div>

                {month.imageUrl ? (
                  <img
                    src={month.imageUrl}
                    alt={`Month ${months[index]} Progress`}
                    className="h-32 w-full object-contain rounded-lg mb-2"
                  />
                ) : (
                  <div className="h-32 w-full bg-gray-200 flex items-center justify-center rounded-lg mb-2 text-gray-400">
                    No Image
                  </div>
                )}

                <input
                  type="text"
                  value={month.progressName}
                  readOnly
                  className="w-full text-center border border-gray-300 rounded-lg px-2 py-1 text-sm bg-gray-100"
                />

                <div
                  className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    month.uploaded ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {month.uploaded ? "Uploaded" : "Pending"}
                </div>

                {/* Optional Admin Actions */}
                <div className="flex gap-2 mt-2">
                  <button className="bg-yellow-500 text-white text-xs px-2 py-1 rounded hover:bg-yellow-600">
                    Edit
                  </button>
                  <button className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMonthlyProgress;

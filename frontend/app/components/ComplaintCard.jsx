import { useRouter } from "next/navigation";

export default function ComplaintCard({ complaint, onDelete, onEdit }) {

  const router = useRouter();

  const canEdit = complaint.status === "submitted";

  const statusStyles = {
    submitted: "bg-blue-100 text-blue-700",
    verified: "bg-indigo-100 text-indigo-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (

    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800">
        {complaint.title}
      </h2>

      {/* Metadata */}
      <div className="mt-3 space-y-1 text-sm text-gray-500">

        <div>📍 {complaint.location}</div>

        <div>📅 {new Date(complaint.created_at).toLocaleDateString()}</div>

      </div>

      {/* Status */}
      <div className="mt-4">

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyles[complaint.status]}`}
        >
          {complaint.status.replace("_", " ")}
        </span>

      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-5">

        <button
          onClick={() => router.push(`/complaints/${complaint.id}`)}
          className="flex-1 bg-gray-900 text-white py-2 rounded-md text-sm hover:bg-gray-800 transition"
        >
          View Details
        </button>

        {canEdit && (
          <>
            <button
              onClick={() => onEdit(complaint.id)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(complaint.id)}
              className="px-3 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
            >
              Delete
            </button>
          </>
        )}

      </div>

    </div>

  );
}
// ComplaintsChart.jsx
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ComplaintsChart({ counts }) {
  const data = {
    labels: ["Pending", "In Progress", "Resolved", "Rejected"],
    datasets: [
      {
        label: "Complaints",
        data: [counts.pending, counts.inprogress, counts.resolved, counts.rejected],
        backgroundColor: [
          "#facc15", // yellow
          "#3b82f6", // blue
          "#22c55e", // green
          "#ef4444", // red
        ],
        borderColor: "#020617", // matches dashboard bg
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0", 
          font: {
          size: 15, 
        },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}
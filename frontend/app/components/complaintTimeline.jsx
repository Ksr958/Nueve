export default function ComplaintTimeline({ status }) {
  
  const baseSteps = ["Submitted", "Verified", "In Progress"];

  
  let finalStep = "Resolved";

  if (status?.toLowerCase() === "rejected") {
    finalStep = "Rejected";
  }

  const steps = [...baseSteps, finalStep];

  const currentIndex = steps.findIndex(
    (step) => step.toLowerCase() === status?.toLowerCase()
  );

  return (
    <div className="flex items-center justify-between w-full">
      
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            
            
            {index !== steps.length-1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-[2px] ${
                  index < currentIndex
                    ? step === "Rejected"
                      ? "bg-red-500"
                      : "bg-blue-500"
                    : "bg-slate-600"
                }`}
              />
            )}

            
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                isActive
                  ? step === "Rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {index + 1}
            </div>

            
            <p
              className={`mt-2 text-sm font-medium ${
                isActive
                  ? step === "Rejected"
                    ? "text-red-400"
                    : "text-white"
                  : "text-slate-400"
              }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}
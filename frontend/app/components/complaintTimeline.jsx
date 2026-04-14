import PropTypes from "prop-types";

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
        const isRejected = step === "Rejected";
        const isCompleted = index < currentIndex;

        // line color logic (NO ternary nesting)
        let lineColor = "bg-slate-600";
        if (isCompleted) {
          lineColor = isRejected ? "bg-red-500" : "bg-blue-500";
        }

        // node color logic
        let nodeClass =
          "bg-slate-700 text-slate-400";

        if (isActive) {
          nodeClass = isRejected
            ? "bg-red-500 text-white"
            : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
        }

        // label color logic
        let labelClass = "text-slate-400";

        if (isActive) {
          labelClass = isRejected ? "text-red-400" : "text-white";
        }

        return (
          <div
            key={`${step}-${index}`}
            className="flex-1 flex flex-col items-center relative"
          >
            {index !== steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-[2px] ${lineColor}`}
              />
            )}

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${nodeClass}`}
            >
              {index + 1}
            </div>

            <p className={`mt-2 text-sm font-medium ${labelClass}`}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

ComplaintTimeline.propTypes = {
  status: PropTypes.string,
};
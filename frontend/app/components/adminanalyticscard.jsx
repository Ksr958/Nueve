export default function AnalyticsCard({ title, value }) {
  return (
    <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/60 shadow-md backdrop-blur-sm">
      
      <h2 className="text-slate-400 text-sm">
        {title}
      </h2>

      <p className="text-xl font-semibold mt-1 text-blue-400">
        {value}
      </p>

    </div>
  );
}
// components/LeftSide.jsx
"use client";

export default function LeftSide() {
  return (
    <div className="flex flex-1 relative bg-[#030712]">
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full  bg-indigo-500/50 blur-[200px]" />

      <div className="relative  p-16 flex flex-col justify-between w-full">
        {/* LOGO */}
        <div className="absolute top-[30px] left-[30px] flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <div className="w-7 h-7 border-[3px] border-white rounded-md rotate-45" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Nueve ResolveX
          </span>
        </div>

        {/* CONTENT */}
        <div className="max-w-xl mt-30 space-y-5">
          <h2 className="text-5xl font-extrabold text-white leading-[1.3]">
            Resolution <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Redefined.
            </span>
          </h2>

          <p className="text-lg text-slate-300 italic">
            A smart complaint management platform that helps organizations track
            issues, assign them to the right teams, and ensure faster resolution
            with transparency.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-6">
            <div>
              <h3 className="text-indigo-400 text-xs font-bold uppercase">
                Automation
              </h3>
              <p className="text-slate-400 text-sm">
                Smart routing that assigns complaints to the right team instantly,
                reducing delays and manual effort
              </p>
            </div>

            <div>
              <h3 className="text-indigo-400 text-xs font-bold uppercase">
                Security
              </h3>
              <p className="text-slate-400 text-sm">
                End-to-end data protection with strict access control, ensuring
                every complaint stays private and secure.
              </p>
            </div>
          </div>

          <div className="flex gap-10 pt-6">
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-xs text-slate-400">Uptime</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-white">2.4k+</p>
              <p className="text-xs text-slate-400">Resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
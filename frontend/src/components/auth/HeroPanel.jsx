import logo from "../../assets/logo.png";
import {
  Database,
  Activity,
  ShieldCheck,
} from 'lucide-react';

const HeroPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,33,61,0.6) 60%, rgba(0,0,0,0.9) 100%)',
      }}
    >
      {/* Animated SVG Data Flow Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <style>{`
            .flow-path {
              stroke-dasharray: 300;
              stroke-dashoffset: 300;
              animation: flow 4s linear infinite;
            }
            .flow-path-2 { animation-delay: 1s; }
            .flow-path-3 { animation-delay: 2s; }
            .flow-path-4 { animation-delay: 0.5s; }
            .flow-path-5 { animation-delay: 1.5s; }
            @keyframes flow {
              0% { stroke-dashoffset: 300; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 0; }
            }
          `}</style>
        </defs>

        {/* Node circles */}
        {[
          [120, 180], [320, 120], [520, 200], [700, 160],
          [200, 380], [420, 320], [600, 400], [780, 300],
          [150, 550], [380, 500], [580, 560], [750, 480],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle
              cx={cx} cy={cy} r="6"
              fill="none"
              stroke="rgba(252,163,17,0.4)"
              strokeWidth="1.5"
            />
            <circle
              cx={cx} cy={cy} r="3"
              fill="rgba(252,163,17,0.6)"
            />
          </g>
        ))}

        {/* Flowing paths */}
        <path
          d="M120,180 C200,150 250,130 320,120"
          className="flow-path"
          fill="none" stroke="rgba(252,163,17,0.5)" strokeWidth="1.5"
        />
        <path
          d="M320,120 C420,110 470,160 520,200"
          className="flow-path flow-path-2"
          fill="none" stroke="rgba(252,163,17,0.4)" strokeWidth="1.5"
        />
        <path
          d="M520,200 C600,220 650,180 700,160"
          className="flow-path flow-path-3"
          fill="none" stroke="rgba(252,163,17,0.5)" strokeWidth="1.5"
        />
        <path
          d="M200,380 C300,340 360,330 420,320"
          className="flow-path flow-path-4"
          fill="none" stroke="rgba(252,163,17,0.3)" strokeWidth="1.5"
        />
        <path
          d="M420,320 C500,310 550,360 600,400"
          className="flow-path flow-path-5"
          fill="none" stroke="rgba(252,163,17,0.4)" strokeWidth="1.5"
        />
        <path
          d="M150,550 C260,520 320,510 380,500"
          className="flow-path flow-path-2"
          fill="none" stroke="rgba(252,163,17,0.3)" strokeWidth="1.5"
        />
        <path
          d="M380,500 C460,490 520,530 580,560"
          className="flow-path flow-path-3"
          fill="none" stroke="rgba(252,163,17,0.35)" strokeWidth="1.5"
        />

        {/* Cross connections */}
        <path
          d="M320,120 C340,240 360,300 420,320"
          className="flow-path flow-path-4"
          fill="none" stroke="rgba(252,163,17,0.15)" strokeWidth="1"
        />
        <path
          d="M520,200 C540,340 560,400 580,560"
          className="flow-path flow-path-5"
          fill="none" stroke="rgba(252,163,17,0.15)" strokeWidth="1"
        />
      </svg>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Databridge Logo"
            className="object-contain flex-shrink-0 h-10 sm:h-12 w-auto max-w-[180px]"
          />
        </div>
      </div>

      {/* Hero Text */}
      <div className="relative z-10 flex flex-col items-start">
        <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
          Connect.
          <br />
          <span className="text-[#fca311]">Explore.</span>
          <br />
          Transfer.
        </h1>
        <p className="text-lg text-[#e5e5e5]/70 max-w-md leading-relaxed">
          Enterprise data connectivity for modern teams. Manage multiple databases,
          explore schemas, and transfer data securely.
        </p>

        {/* Feature callouts */}
        <div className="flex gap-8 mt-10">
          {[
            { icon: Database, label: 'Multi-DB Support' },
            { icon: Activity, label: 'Real-time Monitoring' },
            { icon: ShieldCheck, label: 'Secure Transfers' },
          ].map((f) => {
            const Icon = f.icon;

            return (
              <div key={f.label} className="flex items-center gap-2">
                <Icon
                  size={18}
                  className="text-[#fca311]"
                  strokeWidth={2}
                />
                <span className="text-sm text-[#e5e5e5]/70 font-medium">
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroPanel;
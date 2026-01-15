'use client';

interface AnimatedBackgroundProps {
  backgroundImage?: string | null;
}

export function AnimatedBackground({ backgroundImage }: AnimatedBackgroundProps) {
  if (backgroundImage) {
    return (
      <div className="animated-bg">
        {/* Custom background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'blur(2px)',
          }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/70 to-slate-50/90 dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-950/95" />
        {/* Subtle mesh for depth */}
        <div className="mesh-gradient opacity-30" />
      </div>
    );
  }

  return (
    <div className="animated-bg">
      {/* Mesh gradient background */}
      <div className="mesh-gradient" />

      {/* Floating gradient orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      <div className="floating-orb orb-4" />

      {/* Subtle grid pattern */}
      <div className="grid-pattern" />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const img = size === "sm" ? "h-9" : size === "lg" ? "h-16" : "h-12";
  const text = size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo-guiasense.jpg"
        alt="GuiaSense"
        className={`${img} w-auto object-contain`}
      />
      <span className={`${text} font-extrabold tracking-tight text-slate-900`}>
        Guia<span className="text-brand-600">Sense</span>
      </span>
    </div>
  );
}

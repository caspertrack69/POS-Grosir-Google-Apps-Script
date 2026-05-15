function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-brand-100 text-brand-800",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        variants[variant] || variants.default,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Badge;

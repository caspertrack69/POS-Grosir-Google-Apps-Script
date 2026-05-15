function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
  };

  return (
    <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant] || variants.default].join(" ")}>
      {children}
    </span>
  );
}

export default Badge;

function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors",
        variants[variant] || variants.primary,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

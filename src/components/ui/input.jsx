function Input({ label, id, error, className = "", ...props }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-xs font-medium text-slate-500" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input
        id={id}
        className={[
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
          error ? "border-rose-500" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export default Input;

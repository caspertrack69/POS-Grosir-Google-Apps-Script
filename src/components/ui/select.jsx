function Select({ label, id, options, className = "", ...props }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-xs font-medium text-slate-500" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <select
        id={id}
        className={[
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
          className,
        ].join(" ")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default Select;

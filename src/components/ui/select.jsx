function Select({ label, id, options, className = "", ...props }) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <select
        id={id}
        className={[
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-1",
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

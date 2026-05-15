function Card({ title, description, action, children, className = "" }) {
  return (
    <section className={["rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className].join(" ")}>
      {(title || description || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export default Card;

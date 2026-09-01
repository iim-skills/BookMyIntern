export default function TrustStrip() {
  const companies = [
    'Capgemini',
    'Genpact',
    'ICICI Bank',
    'Kotak',
    'Tech Mahindra',
  ];

  return (
    <section className="bg-white border-y border-surface-mid py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 select-none">
        {/* Left Label */}
        <span className="text-sm font-semibold text-ink-muted uppercase tracking-widest whitespace-nowrap">
          Trusted by hiring teams at
        </span>

        {/* Right - Company Logos */}
        <div className="flex items-center gap-8 flex-wrap justify-center">
          {companies.map((company) => (
            <span
              key={company}
              className="text-ink-muted font-semibold text-sm opacity-60 hover:opacity-100 transition-opacity duration-200 cursor-default select-none"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

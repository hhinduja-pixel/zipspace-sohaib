const stats = [
  {
    value: "1M+",
    label: "Items Securely Stored",
  },
  {
    value: "11546+",
    label: "Monthly Subscriptions Sold",
  },
//   {
//     value: "75+",
//     label: "Cities Served Pan India",
//   },
];

const Why_ZipSpace = () => {
  return (
    <section className="bg-background px-4 py-10 md:px-8 md:py-12">
      <div className="container-tight mx-auto">
        <div className="max-w-4xl mx-auto rounded-sm bg-card p-4 md:p-6 border border-border/70">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-secondary mb-6">
            Why Zipspace?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-accent/40 px-4 py-6 text-center border border-primary/10"
              >
                <p className="text-5xl md:text-6xl font-extrabold text-primary leading-none">
                  {stat.value}
                </p>
                <p className="mt-2 text-lg md:text-xl font-medium text-primary/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Why_ZipSpace;

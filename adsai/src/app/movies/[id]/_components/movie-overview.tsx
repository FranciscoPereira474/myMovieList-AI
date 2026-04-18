interface MovieOverviewProps {
  overview: string;
}

/**
 * * Renders a section with the movie overview.
 *  *
 *  * @param {MovieOverviewProps} props - The component's properties.
 *  * @param {string} props.overview - The movie overview text.
 *  *
 *  * @returns {JSX.Element} The rendered section element.
 */
export function MovieOverview({ overview }: MovieOverviewProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-white mb-2 border-l-4 border-brand-500 pl-3">
        Overview
      </h3>
      <p className="text-neutral-300 leading-relaxed text-lg font-serif">
        {overview}
      </p>
    </section>
  );
}

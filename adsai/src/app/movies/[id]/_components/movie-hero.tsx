import Image from "next/image";

interface MovieHeroProps {
  backdropUrl: string | null;
}

/**
 * * Renders the movie hero component with a backdrop image.
 *  *
 *  * @param {MovieHeroProps} props - The properties of the movie hero component.
 *  * @returns {JSX.Element} The JSX element representing the movie hero component.
 */
export function MovieHero({ backdropUrl }: MovieHeroProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-[600px] z-0 pointer-events-none">
      <div className="relative w-full h-full">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt="Movie backdrop"
            fill
            className="object-cover opacity-50"
            style={{
              maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            }}
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-transparent to-transparent" />
      </div>
    </div>
  );
}

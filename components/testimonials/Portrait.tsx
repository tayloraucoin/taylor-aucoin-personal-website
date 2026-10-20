import Image from "next/image";

/** A testimonial's round photo, 48px. Absent `src` renders nothing. */
export function Portrait({
  name,
  src,
  className = "",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={`Photo of ${name}`}
      width={48}
      height={48}
      className={`h-12 w-12 shrink-0 rounded-full object-cover ${className}`}
    />
  );
}

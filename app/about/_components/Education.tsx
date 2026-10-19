import { education } from "@/content/about";
import { Row, SectionHeading } from "./Row";

export function Education() {
  return (
    <section aria-labelledby="education-heading" className="mt-16 md:mt-24">
      <SectionHeading id="education-heading">Education</SectionHeading>
      <ul>
        {education.map((e) => (
          <Row
            key={e.name + e.role}
            name={e.name}
            role={e.role}
            years={e.years}
          />
        ))}
      </ul>
    </section>
  );
}

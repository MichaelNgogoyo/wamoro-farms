import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, text, light = false, children }: {
  eyebrow: string;
  title: string;
  text?: string;
  light?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`section-heading ${light ? "section-heading-light" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

import "./SectionTitle.css";

export default function SectionTitle({ text, align = "center" }) {
  return (
    <h3 className={`section-title ${align}`}>
      <span>{text}</span>
    </h3>
  );
}

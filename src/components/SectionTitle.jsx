function SectionTitle({
  eyebrow,
  title,
  intro,
  id,
  align = 'left',
  tone = 'default',
  titleTag: TitleTag = 'h2',
}) {
  return (
    <div className={`section-heading section-heading-${align} section-heading-tone-${tone}`}>
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <TitleTag className="section-title" id={id}>
        {title}
      </TitleTag>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </div>
  );
}

export default SectionTitle;

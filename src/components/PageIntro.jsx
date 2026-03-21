import SectionTitle from './SectionTitle';

function PageIntro({ eyebrow, title, intro, children, className = '', headerTone = 'dark' }) {
  return (
    <section
      className={`section page-intro ${className}`.trim()}
      data-header-tone={headerTone}
      aria-labelledby="page-intro-title"
    >
      <div className="section-inner page-intro-inner">
        <SectionTitle
          eyebrow={eyebrow}
          id="page-intro-title"
          intro={intro}
          title={title}
          titleTag="h1"
        />

        {children ? <div className="page-intro-actions">{children}</div> : null}
      </div>
    </section>
  );
}

export default PageIntro;

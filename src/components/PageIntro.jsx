import SectionTitle from './SectionTitle';

function PageIntro({ eyebrow, title, intro }) {
  return (
    <section className="section page-intro" aria-labelledby="page-intro-title">
      <div className="section-inner page-intro-inner">
        <SectionTitle
          eyebrow={eyebrow}
          id="page-intro-title"
          intro={intro}
          title={title}
          titleTag="h1"
        />
      </div>
    </section>
  );
}

export default PageIntro;

import HeroCarousel from '../components/HeroCarousel';
import FlowingMenu from '../components/menu/FlowingMenu';
import { MENU_GROUPS, buildMenuCategoryHref } from '../components/menu/menuGroups';
import { restaurant } from '../data/siteContent';

const MENU_HERO_SLIDES = [
  restaurant.preview.image,
  restaurant.about.image,
  restaurant.philosophy.image,
  restaurant.aboutPage.team.image,
];

const MENU_LANDING_GROUPS = MENU_GROUPS.filter((group) => group.id !== 'degustazione');

const MENU_LANDING_MARQUEE_IMAGES = {
  classiche: restaurant.preview.image.src,
  bianche: restaurant.philosophy.image.src,
  speciali: restaurant.aboutPage.team.image.src,
  calzoni: restaurant.aboutPage.story.image.src,
  fritteria: restaurant.aboutPage.philosophy.image.src,
  birre: restaurant.about.image.src,
  vini: restaurant.story.image.src,
};

const MENU_FLOW_ITEMS = MENU_LANDING_GROUPS.map((group) => ({
  link: buildMenuCategoryHref(group.id),
  text: group.title,
  image: MENU_LANDING_MARQUEE_IMAGES[group.id],
}));

function MenuPage() {
  return (
    <>
      <section className="menu-landing-hero" data-header-tone="light" aria-labelledby="menu-landing-title">
        <HeroCarousel autoPlayDelay={8200} slides={MENU_HERO_SLIDES} />

        <div className="menu-landing-hero-chrome">
          <div className="section-inner menu-landing-hero-inner">
            <div className="section-heading section-heading-center menu-landing-hero-copy">
              <h1 id="menu-landing-title" className="section-title">
                Scopri il menu
              </h1>

              <a className="menu-landing-scroll" href="#menu-categories" aria-label="Scorri verso le categorie del menu">
                <span className="menu-landing-scroll-gif" aria-hidden="true">
                  <span className="menu-landing-scroll-dot" />
                </span>
                <span className="menu-landing-scroll-text">Scorri</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section menu-landing-section menu-landing-flow-section"
        data-header-tone="dark"
        id="menu-categories"
        aria-labelledby="menu-categories-title"
      >
        <div className="section-inner menu-landing-flow-inner">
          <h2 id="menu-categories-title" className="sr-only">
            Categorie del menu
          </h2>

          <FlowingMenu
            bgColor="transparent"
            borderColor="rgba(61, 43, 33, 0.12)"
            items={MENU_FLOW_ITEMS}
            marqueeBgColor="var(--color-espresso)"
            marqueeTextColor="var(--color-shell)"
            speed={18}
            textColor="var(--color-espresso)"
          />
        </div>
      </section>
    </>
  );
}

export default MenuPage;

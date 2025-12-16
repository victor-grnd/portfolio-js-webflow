const footer = document.querySelector(".footer_wrap");
const hero = document.querySelector(".hero_wrap");
const skills = document.querySelector(".works_wrap");

//-----------------FOOTER--------------------

window.addEventListener("DOMContentLoaded", () => {
  //--------LENIS----------
  function initLenis() {
    const lenis = new Lenis({
      smooth: true,
      lerp: 0.12,
      autoRaf: true,
    });
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
  initLenis();
  function footerAnimation() {
    function animateFooterCircles() {
      const footerCircles = footer.querySelectorAll(".footer_decoration");

      const footerTl = gsap.timeline();

      footerCircles.forEach((circle) => {
        const [axis, percentage] = circle.classList.contains("is-left")
          ? ["yPercent", -61]
          : ["xPercent", 70];

        footerTl.fromTo(
          circle,
          {
            [axis]: percentage,
            duration: 1,
          },
          {
            [axis]: 0,
            duration: 1,
          },
          0
        );
      });
    }
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateFooterCircles();
            footerObserver.disconnect();
          }
        });
      },
      {
        threshold: 0.6,
      }
    );

    footerObserver.observe(footer);
  }

  footerAnimation();

  //---------------LOAD ANIMATION------------------------

  const heroSpans = Array.from(hero.querySelectorAll(".hero_heading_span"));
  const heroSpansFirstLineSplited = heroSpans
    .slice(0, 3)
    .map((span) => {
      return initSplit(span);
    })
    .flat();
  const heroSpanSecondLineSplited = initSplit(heroSpans[3]);
  const heroCircle = document.querySelector(".hero_circle");

  function initSplit(text) {
    const splitedText = SplitText.create(text, {
      type: "chars",
      mask: "chars",
    });
    return splitedText.chars;
  }

  function initStaggerTween(chars) {
    const tween = gsap.from(chars, {
      opacity: 0,
      yPercent: 45,
      stagger: {
        amount: 0.9,
      },
      duration: 0.5,
    });

    return tween;
  }

  const firstLineTween = initStaggerTween(heroSpansFirstLineSplited);
  const secondLineTween = initStaggerTween(heroSpanSecondLineSplited);
  const circleTween = gsap.from(
    heroCircle,
    {
      scale: 0,
      duration: 1,
    },
    1.63
  );

  const tlHeroStagger = gsap.timeline();
  tlHeroStagger
    .add(firstLineTween, 0)
    .add(secondLineTween, 0.84)
    .add(circleTween, 1.63);
});

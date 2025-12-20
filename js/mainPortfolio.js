const sections = Array.from(document.querySelectorAll("[data-section]"));
const footer = document.querySelector(".footer_wrap");
const hero = document.querySelector(".hero_wrap");
let windowHeight = window.innerHeight;
let windowMiddle = windowHeight * 0.3;
let windowWidth = window.innerWidth;
let hasAnimatedNumbers = false;

//-------------UTILITIES-------------
function initSplit(text) {
  const splitedText = SplitText.create(text, {
    type: "chars",
    mask: "chars",
  });
  return splitedText.chars;
}

function calculateSectionMiddle(section) {
  const rect = section.boundingClientRect; // because I pass an entry and not a dom element

  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(window.innerHeight, rect.bottom);
  const visibleHeight = visibleBottom - visibleTop;
  const visibleCenter = visibleTop + visibleHeight / 2;

  return visibleCenter;
}

function reduceSections(sections) {
  const centeredMostSection = sections.reduce((bestEntrySoFar, section) => {
    const bestEntrySoFarCenter = calculateSectionMiddle(bestEntrySoFar);
    const sectionCenter = calculateSectionMiddle(section);
    return Math.abs(windowMiddle - sectionCenter) <
      Math.abs(windowMiddle - bestEntrySoFarCenter)
      ? section
      : bestEntrySoFar;
  });

  return centeredMostSection;
}

//-----------------FOOTER--------------------

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

//------------------NUMBERS SCROLL-------------

const currentSectionObserver = new IntersectionObserver((entries) => {
  const mostCenterdSection = reduceSections(entries).target;
  const sectionName = mostCenterdSection.dataset.section;

  if (sectionName === "services") {
    animateNumberScroll(mostCenterdSection);
  }
});

sections.forEach((section) => {
  currentSectionObserver.observe(section);
});

function animateNumberScroll(section) {
  if (hasAnimatedNumbers) return;
  hasAnimatedNumbers = true;
  const cardsCount = document.querySelectorAll(".services_card_wrap").length;
  const digitsScrollWrapper = document.querySelector(".services_digits-scroll");
  const digitHeight = 5.19;

  for (let i = 1; i < cardsCount + 1; i++) {
    const spanEl = document.createElement("span");
    spanEl.textContent = i;
    spanEl.classList.add("services_span");
    digitsScrollWrapper.appendChild(spanEl);
  }

  const digitsScrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "20% 50%",
      end: "90% top",
      scrub: true,
      markers: false,
    },
  });

  digitsScrollTl.to(digitsScrollWrapper, {
    y: -((cardsCount - 1) * digitHeight + 2) + "rem", // I add 2 for safety margin
    ease: "power1.in",
  });
}

//-------------------TEXT MASK ANIMATION----------------------

function textMaskAnimation() {
  let textSplited;
  let linesToAnimate;
  let resizeTimeout;
  const textToAnimateWrapper = document.querySelector(".about_content");
  const textToSplit = document.querySelector(".about_text.is-above");

  function initTextAnimation() {
    const textToSplitClone = textToSplit.cloneNode(true);
    textToSplitClone.classList.remove("is-above");
    textToSplitClone.classList.add("is-below");
    textToAnimateWrapper.appendChild(textToSplitClone);
    textSplited = SplitText.create(textToSplit, {
      type: "lines",
      linesClass: "about_line",
    });
    linesToAnimate = textSplited.lines;

    createAnimation();
  }

  function createAnimation() {
    linesToAnimate.forEach((line) => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: line,
            start: "top 75%",
            end: "bottom center",
            scrub: 1,
          },
        })
        .to(line, {
          "--size": "100%",
          duration: 1,
        });
    });
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (windowWidth !== window.innerWidth) {
        textSplited.revert();
        const textAnimateBackgrounds = document.querySelectorAll(
          ".about_text.is-below"
        );
        textAnimateBackgrounds.forEach((bg) => {
          bg.remove();
        });
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger && st.trigger.classList.contains("about_line")) {
            st.kill();
          }
        });

        initTextAnimation();

        windowWidth = window.innerWidth;
      }
    }, 200);
  });

  initTextAnimation();
}

textMaskAnimation();

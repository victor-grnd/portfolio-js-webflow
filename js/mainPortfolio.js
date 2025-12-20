const sections = Array.from(document.querySelectorAll("[data-section]"));
const footer = document.querySelector(".footer_wrap");
const hero = document.querySelector(".hero_wrap");
let windowHeight = window.innerHeight;
let windowMiddle = windowHeight * 0.3;
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
  } else if (sectionName === "about") {
    animateTextColor(mostCenterdSection);
  }
});

sections.forEach((section) => {
  currentSectionObserver.observe(section);
});

function animateNumberScroll(section) {
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
      markers: true,
    },
  });

  digitsScrollTl.to(digitsScrollWrapper, {
    y: -((cardsCount - 1) * digitHeight + 2) + "rem", // I add 2 for safety margin
    ease: "power1.in",
  });
}

//----------------TEXT COLOR CHANGE ON SCROLL-------------------

/*function initLinesSplit(text) {
  const splitedText = new SplitType(text, {
    types: "lines",
  });
  return [splitedText, splitedText.lines];
}

function animateTextColor(section) {
  const textToAnimate = section.querySelector(".about_text");
  if (!textToAnimate) return;

  let splitInstance;
  let resizeTimeout;

  function initTextAnimation() {
    ScrollTrigger.getAll().forEach((st) => {
      if (section.contains(st.trigger)) {
        st.kill();
      }
    });

    if (splitInstance) {
      splitInstance.revert();
    }

    const [split, lines] = initLinesSplit(textToAnimate);
    splitInstance = split;

    createBlackMasks(lines);
    createLinesMasksStagger(lines);

    ScrollTrigger.refresh();
  }

  initTextAnimation();

  function createBlackMasks(lines) {
    lines.forEach((line) => {
      if (line.querySelector(".black_mask")) return;
      line.classList.add("about_line");
      const blackMask = document.createElement("span");
      blackMask.classList.add("black_mask");
      line.appendChild(blackMask);
    });
  }

  function createLinesMasksStagger(lines) {
    lines.forEach((line) => {
      const mask = line.querySelector(".black_mask");

      gsap
        .timeline({
          scrollTrigger: {
            trigger: line,
            start: "top 75%",
            end: "bottom center",
            scrub: 1,
          },
        })
        .to(mask, {
          width: "0%",
          ease: "power1.in",
        });
    });
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initTextAnimation, 200);
  });
}

animateTextColor(document.querySelector(".about_wrap"));
*/

function textAnimate() {
  const textToSplit = document.querySelector(".about_text");

  function initTextSplit() {
    typeSplit = SplitText.create(textToSplit, {
      types: "lines",
      lineClass: "line",
    });

    // Dupliquer les éléments avec l'attribut "textscroll"
    document.querySelectorAll("[textscroll]").forEach((el) => {
      const clone = el.cloneNode(true);
      clone.classList.remove("line");
      clone.classList.add("is-scroll-bg");
      el.after(clone);
    });

    createAnimation();
  }
}
let typeSplit;

runSplit();

let windowWidth = window.innerWidth;

window.addEventListener("resize", () => {
  if (windowWidth !== window.innerWidth) {
    // Réinitialiser SplitText
    typeSplit.revert();

    // Supprimer les éléments clonés
    document.querySelectorAll(".is-scroll-bg").forEach((el) => el.remove());

    // Reset GSAP & ScrollTrigger
    gsap.globalTimeline.clear();
    ScrollTrigger.getAll().forEach((st) => st.kill());

    // Relancer
    runSplit();

    windowWidth = window.innerWidth;
  }
});

gsap.registerPlugin(ScrollTrigger);

function createAnimation() {
  document.querySelectorAll(".line:not(.is-scroll-bg)").forEach((line) => {
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
        "--size": "-3%",
        duration: 1,
      });
  });
}

// DOM ready (équivalent de $(document).ready)
document.addEventListener("DOMContentLoaded", () => {
  const thumbsList = document.querySelector(".testimonial-thumbs-list");
  if (!thumbsList) return;

  const height = thumbsList.offsetHeight;
  const topValue = `calc(50vh - ${height / 2}px)`;

  thumbsList.style.top = topValue;
});

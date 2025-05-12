// FEATURES
document.addEventListener("DOMContentLoaded", () => {
  const featuresContainer = document.getElementById("features-container");
  const jsonFilePath = "/data/features.json";

  // --- This is where you'd initialize your IntersectionObserver ---
  // --- For this example, I'll create a specific one for features ---
  let featureObserver = null;

  function initFeatureObserver() {
    if (featureObserver) {
      featureObserver.disconnect();
    }

    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const animationName = el.dataset.animation || "fade-in-up";
          const animationDelay = el.dataset.delay || "0s";
          const animationDuration = el.dataset.duration;

          const animationClass = `anim-${animationName}`;

          if (animationDelay) {
            el.style.animationDelay = animationDelay;
          }
          if (animationDuration) {
            el.style.animationDuration = animationDuration;
          }
          // Ensure it's hidden before animation starts, if not handled by CSS alone
          el.style.opacity = "0";
          requestAnimationFrame(() => {
            // Ensures opacity update is processed before class addition
            el.classList.add(animationClass);
          });

          observer.unobserve(el);
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0.1, // Adjust as needed
    };
    featureObserver = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
  }
  // --- End of IntersectionObserver setup for features ---

  if (!featuresContainer) {
    console.error("Error: Could not find the '#features-container' element.");
    return;
  }

  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("JSON data is not an array!");
      }
      featuresContainer.innerHTML = "";
      initFeatureObserver();

      data.forEach((item, index) => {
        const featureDiv = document.createElement("div");
        featureDiv.classList.add("feature-item");
        featureDiv.classList.add("animate-on-scroll");
        featureDiv.dataset.animation = "fade-in-up";
        featureDiv.dataset.delay = `${index * 0.2}s`;

        featureDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.title}" class="feature-item-icon">
            <h3 class="features-item-header">${item.title}</h3>
            <p class="features-item-body">${item.description}</p>
        `;
        featuresContainer.appendChild(featureDiv);

        // **MODIFICATION: Tell the observer to watch this new element**
        if (featureObserver) {
          featureObserver.observe(featureDiv);
        } else if (window.yourGlobalScrollObserver) {
          // If you have a global one
          window.yourGlobalScrollObserver.observe(featureDiv);
        }
      });
    })
    .catch((error) => {
      console.error("Error loading or processing features:", error);
      featuresContainer.innerHTML = `<p class="error-message">Could not load features. ${error.message}</p>`;
    });
});
// NUMBER WIND-UP ANIMATION
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll("#stat-container h1");
  const animationDuration = 1000;

  const animateValue = (element, start, end, duration, suffix, decimals) => {
    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const linearProgress = Math.min(elapsedTime / duration, 1);

      const easedProgress = 1 - Math.pow(1 - linearProgress, 3);

      let currentValue = start + (end - start) * easedProgress;

      if (decimals > 0) {
        currentValue = currentValue.toFixed(decimals);
      } else {
        currentValue = Math.floor(currentValue);
      }

      element.textContent = currentValue + suffix;

      if (linearProgress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = end.toFixed(decimals) + suffix;
      }
    };

    requestAnimationFrame(step);
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const h1 = entry.target;
        const targetValue = parseFloat(h1.getAttribute("data-target"));
        const suffix = h1.getAttribute("data-suffix") || "";
        const decimals = parseInt(h1.getAttribute("data-decimals") || "0");
        const startValue = decimals > 0 ? 0.0 : 0;

        animateValue(
          h1,
          startValue,
          targetValue,
          animationDuration,
          suffix,
          decimals
        );
        observer.unobserve(h1);
      }
    });
  };

  const observerOptions = {
    root: null,
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  counters.forEach((counter) => {
    const suffix = counter.getAttribute("data-suffix") || "";
    const decimals = parseInt(counter.getAttribute("data-decimals") || "0");
    const initialText =
      decimals > 0 ? (0).toFixed(decimals) + suffix : "0" + suffix;
    counter.textContent = initialText;
    observer.observe(counter);
  });
});

// FOR WHO SECTION
document.addEventListener("DOMContentLoaded", () => {
  const textItemsContainer = document.getElementById("for-who-text-items");
  const forWhoImage = document.getElementById("for-who-image");
  const jsonFilePath = "/data/procrastinators.json";

  if (!textItemsContainer) {
    console.error("Error: Could not find the '#for-who-text-items' element.");
    return;
  }
  if (!forWhoImage) {
    console.error("Error: Could not find the '#for-who-image' element.");
  }

  /**
   * Sets the active card and updates the corresponding image with a fade effect.
   * @param {HTMLElement | null} cardElement - The card element to activate.
   * @param {HTMLImageElement} imageElement - The image element to update.
   */
  function setActiveCard(cardElement, imageElement) {
    const allCards = textItemsContainer.querySelectorAll(".for-who-item-card");
    allCards.forEach((card) => card.classList.remove("active"));

    if (!cardElement) return;

    cardElement.classList.add("active");
    const newImageSrc = cardElement.dataset.imageSrc;

    if (!imageElement) return;

    if (newImageSrc) {
      const currentImageAttributeSrc = imageElement.getAttribute("src");

      if (currentImageAttributeSrc !== newImageSrc) {
        const updateImageAndFadeIn = () => {
          imageElement.src = newImageSrc;
          const titleElement = cardElement.querySelector(".for-who-item-title");
          imageElement.alt = titleElement
            ? titleElement.textContent.trim()
            : "Illustration for " +
              (titleElement
                ? titleElement.textContent.trim()
                : newImageSrc.split("/").pop());

          if (imageElement.complete && imageElement.naturalHeight !== 0) {
            imageElement.classList.remove("image-fade-out");
          } else {
            imageElement.onload = () => {
              imageElement.classList.remove("image-fade-out");
              imageElement.onload = null;
            };
            imageElement.onerror = () => {
              console.error("Error loading image:", newImageSrc);
              imageElement.classList.remove("image-fade-out");
              imageElement.onerror = null;
            };
          }
        };

        if (
          getComputedStyle(imageElement).opacity === "0" ||
          !currentImageAttributeSrc
        ) {
          imageElement.classList.add("image-fade-out");
          updateImageAndFadeIn();
        } else {
          imageElement.classList.add("image-fade-out");
          imageElement.addEventListener(
            "transitionend",
            function onFadeOutEnd() {
              imageElement.removeEventListener("transitionend", onFadeOutEnd);
              updateImageAndFadeIn();
            },
            { once: true }
          );
        }
      } else {
        imageElement.classList.remove("image-fade-out");
      }
    } else {
      console.warn(
        "Active card is missing 'data-image-src' attribute for card:",
        cardElement
      );
      imageElement.classList.add("image-fade-out");
    }
  }

  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("JSON data is not an array!");
      }
      if (data.length === 0) {
        textItemsContainer.innerHTML = "<p>No items to display.</p>";
        if (forWhoImage) forWhoImage.style.display = "none";
        return;
      }

      textItemsContainer.innerHTML = "";

      data.forEach((item) => {
        if (!item.title || !item.description || !item.imageSrc) {
          console.warn("Skipping item due to missing data:", item);
          return;
        }

        const card = document.createElement("div");
        card.classList.add("for-who-item-card");
        card.dataset.imageSrc = item.imageSrc;

        card.innerHTML = `
            <h4 class="for-who-item-title">${item.title}</h4>
            <p class="for-who-item-body">${item.description}</p>
        `;

        textItemsContainer.appendChild(card);
      });

      const firstCard = textItemsContainer.querySelector(".for-who-item-card");
      if (firstCard && forWhoImage) {
        setActiveCard(firstCard, forWhoImage);
      } else if (firstCard) {
        firstCard.classList.add("active");
        console.warn(
          "First card found, but image element is missing. Cannot set initial image."
        );
      }

      textItemsContainer.addEventListener("click", (event) => {
        const clickedCard = event.target.closest(".for-who-item-card");
        if (clickedCard) {
          setActiveCard(clickedCard, forWhoImage);
        }
      });
    })
    .catch((error) => {
      console.error("Error loading or processing procrastinator data:", error);
      textItemsContainer.innerHTML = `<p class="error-message">Could not load content. ${error.message}</p>`;
      if (forWhoImage) {
        forWhoImage.src = "/assets/for_who/error_placeholder.png";
        forWhoImage.alt = "Error loading content";
        forWhoImage.classList.remove("image-fade-out");
      }
    });
});

// TESTIMONIALS SECTION
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".testimonial-container");
  const jsonFilePath = "/data/testimonials.json";

  const breakpoints = {
    small: 768,
    medium: 1180,
  };
  const itemsToShowConfig = {
    small: 4,
    medium: 6,
  };
  const RESIZE_DEBOUNCE_DELAY = 250;

  let allTestimonials = [];
  let loadMoreBtn = null;
  let isShowingAll = false;
  let resizeTimeout;
  let testimonialObserver = null;

  if (!container) {
    console.error(
      "Error: Could not find the '.testimonial-container' element."
    );
    return;
  }

  function initTestimonialObserver() {
    if (testimonialObserver) {
      testimonialObserver.disconnect();
    }

    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const animationName = card.dataset.animation || "fade-in-up";
          const animationDelay = card.dataset.delay || "0s";
          const animationDuration = card.dataset.duration;

          const animationClass = `anim-${animationName}`;

          if (animationDelay) {
            card.style.animationDelay = animationDelay;
          }
          if (animationDuration) {
            card.style.animationDuration = animationDuration;
          }
          card.style.opacity = "0";
          requestAnimationFrame(() => {
            card.classList.add(animationClass);
          });

          observer.unobserve(card); // Animate only once
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0.1, // Adjust as needed
    };

    testimonialObserver = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
  }

  function debounce(func, delay) {
    return function (...args) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  function generateStarsHTML(rating) {
    const maxStars = 5;
    let starsHTML = "";
    const numRating = Number(rating) || 0;
    const filledStars = Math.max(0, Math.min(maxStars, Math.round(numRating)));

    for (let i = 0; i < maxStars; i++) {
      if (i < filledStars) {
        starsHTML += '<i class="fa fa-star"></i> ';
      } else {
        starsHTML += '<i class="fa fa-star-o"></i> ';
      }
    }
    return starsHTML.trim();
  }

  function createTestimonialCard(testimonial, index) {
    const card = document.createElement("div");
    card.classList.add("testimonial-card");

    card.classList.add("animate-on-scroll");
    card.dataset.animation = "fade-in-up";
    card.dataset.delay = `${index * 0.1}s`;

    card.innerHTML = `
            <div class="testimonial-card-inner-content"> 
                <div class="stars" aria-label="${
                  testimonial.rating
                } out of 5 stars">
                    ${generateStarsHTML(testimonial.rating)}
                </div>
                <p class="testimonial-text">${testimonial.text}</p>
                <div class="profile">
                    <img src="${
                      testimonial.imageSrc
                    }" alt="Profile picture of ${
      testimonial.name
    }" class="profile-img">
                    <div class="profile-info">
                        <span class="profile-name">${testimonial.name}</span>
                        <span class="profile-title">${testimonial.title}</span>
                    </div>
                </div>
            </div>
        `;
    return card;
  }

  function renderTestimonials(count) {
    if (!container) return;

    if (testimonialObserver) {
      container
        .querySelectorAll(".testimonial-card")
        .forEach((card) => testimonialObserver.unobserve(card));
    }

    container.innerHTML = "";

    const testimonialsToDisplay = allTestimonials.slice(0, count);
    testimonialsToDisplay.forEach((testimonial, index) => {
      const card = createTestimonialCard(testimonial, index);
      container.appendChild(card);
      if (testimonialObserver) {
        testimonialObserver.observe(card);
      }
    });
    updateLoadMoreButton();
  }

  function getInitialItemsCount() {
    const width = window.innerWidth;
    if (width < breakpoints.small) {
      return itemsToShowConfig.small;
    } else if (width <= breakpoints.medium) {
      return itemsToShowConfig.medium;
    } else {
      return allTestimonials.length;
    }
  }

  function updateLoadMoreButton() {
    const initialCount = getInitialItemsCount();
    const shouldShowButton =
      allTestimonials.length > initialCount &&
      window.innerWidth <= breakpoints.medium;

    if (loadMoreBtn && loadMoreBtn.parentNode) {
      loadMoreBtn.parentNode.removeChild(loadMoreBtn);
      loadMoreBtn = null;
    }

    if (shouldShowButton) {
      loadMoreBtn = document.createElement("button");
      loadMoreBtn.style.cssText =
        "display: block; margin: 20px auto; padding: 10px 20px; cursor: pointer;";
      loadMoreBtn.addEventListener("click", handleLoadMoreClick);
      loadMoreBtn.className = "btn btn-primary";

      const buttonContainer = container.parentNode;
      if (buttonContainer) {
        buttonContainer.insertBefore(loadMoreBtn, container.nextSibling);
      }

      if (isShowingAll) {
        loadMoreBtn.innerHTML = 'Show Less  <i class="fa fa-minus"></i>';
        loadMoreBtn.setAttribute("aria-expanded", "true");
      } else {
        loadMoreBtn.innerHTML = 'Load More  <i class="fa fa-plus"></i>';
        loadMoreBtn.setAttribute("aria-expanded", "false");
      }
    }
  }

  function handleLoadMoreClick() {
    isShowingAll = !isShowingAll;
    if (isShowingAll) {
      renderTestimonials(allTestimonials.length);
    } else {
      renderTestimonials(getInitialItemsCount());
    }
  }

  function updateDisplayBasedOnSize() {
    const initialCount = getInitialItemsCount();
    const needsButtonNow =
      allTestimonials.length > initialCount &&
      window.innerWidth <= breakpoints.medium;

    if (isShowingAll && !needsButtonNow) {
      renderTestimonials(allTestimonials.length);
    } else if (isShowingAll && needsButtonNow) {
      renderTestimonials(allTestimonials.length);
    } else {
      isShowingAll = false;
      renderTestimonials(initialCount);
    }
    updateLoadMoreButton();
  }

  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("JSON data is not an array!");
      }
      allTestimonials = data;

      initTestimonialObserver();
      updateDisplayBasedOnSize();

      window.addEventListener(
        "resize",
        debounce(updateDisplayBasedOnSize, RESIZE_DEBOUNCE_DELAY)
      );
    })
    .catch((error) => {
      console.error("Error loading testimonials:", error);
      if (container) {
        container.innerHTML = `<div class="error-message" style="color: red; text-align: center;">Could not load testimonials. ${error.message}</div>`;
      }
    });
});
// LOCATIONS
document.addEventListener("DOMContentLoaded", () => {
  const locationsGrid = document.getElementById("locations-grid");
  const jsonFilePath = "/data/location.json";

  if (!locationsGrid) {
    console.error("Error: Could not find the '#locations-grid' element.");
    return;
  }

  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("Location data is not an array!");
      }

      locationsGrid.innerHTML = "";

      data.forEach((location) => {
        const card = document.createElement("div");
        card.classList.add("location-card");
        const iconHTML = `<span class="location-icon ${location.iconClass}" aria-hidden="true"></span>`;

        card.innerHTML = `
                    <img src="${location.iconClass}">
                    <h3 class="location-country">${location.country}</h3>
                    <p class="location-address">
                        ${location.addressLine1}<br>
                        ${location.addressLine2}
                    </p>
                `;

        locationsGrid.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error loading location data:", error);
      locationsGrid.innerHTML = `<div class="error-message">Could not load office locations. ${error.message}</div>`;
    });
});

// FAQ SECTION
document.addEventListener("DOMContentLoaded", () => {
  const accordionContainer = document.getElementById("faq-accordion");
  const jsonFilePath = "/data/faqs.json";

  if (!accordionContainer) {
    console.error("Error: Could not find the '#faq-accordion' element.");
    return;
  }

  fetch(jsonFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("FAQ data is not an array!");
      }

      accordionContainer.innerHTML = "";

      data.forEach((faqItem, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("faq-item");

        const answerId = `faq-answer-${index}`;
        const questionId = `faq-question-${index}`;

        const button = document.createElement("button");
        button.classList.add("faq-question");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", answerId);
        button.id = questionId;

        button.innerHTML = `
                    <div class="faq-question-box"><img src="/assets/qmark.png">
                    <span class="faq-question-text">${faqItem.question}</span></div>
                    <img class="icon-chevron" aria-hidden="true" src="/assets/caret_down.png">
                `;

        const answerDiv = document.createElement("div");
        answerDiv.classList.add("faq-answer");
        answerDiv.id = answerId;
        answerDiv.setAttribute("role", "region");
        answerDiv.setAttribute("aria-labelledby", questionId);
        answerDiv.innerHTML = `<p>${faqItem.answer}</p>`;
        answerDiv.hidden = true;
        answerDiv.style.maxHeight = "0px";
        answerDiv.style.overflow = "hidden";
        answerDiv.style.transition = "max-height 0.3s ease-out";

        itemDiv.appendChild(button);
        itemDiv.appendChild(answerDiv);

        accordionContainer.appendChild(itemDiv);
      });

      const thirdQuestionButton = document.getElementById("faq-question-2");
      const thirdAnswerPanel = document.getElementById("faq-answer-2");

      if (thirdQuestionButton && thirdAnswerPanel) {
        thirdQuestionButton.setAttribute("aria-expanded", "true");
        thirdAnswerPanel.hidden = false;
        thirdAnswerPanel.classList.add("open");
        requestAnimationFrame(() => {
          thirdAnswerPanel.style.maxHeight =
            thirdAnswerPanel.scrollHeight + "px";
        });
      }

      accordionContainer.addEventListener("click", (event) => {
        const clickedQuestionButton = event.target.closest(".faq-question");

        if (!clickedQuestionButton) return;

        const targetAnswerPanel = document.getElementById(
          clickedQuestionButton.getAttribute("aria-controls")
        );
        const isTargetCurrentlyExpanded =
          clickedQuestionButton.getAttribute("aria-expanded") === "true";

        if (isTargetCurrentlyExpanded) {
          // Clicked an open panel: close it immediately (no animation)
          clickedQuestionButton.setAttribute("aria-expanded", "false");
          targetAnswerPanel.classList.remove("open");
          targetAnswerPanel.style.maxHeight = "0px"; // Set to collapsed state
          targetAnswerPanel.hidden = true; // Hide immediately
        } else {
          // Clicked a closed panel:
          // 1. Close any other open panels immediately (no animation)
          accordionContainer
            .querySelectorAll(".faq-question[aria-expanded='true']")
            .forEach((openButton) => {
              const otherAnswerPanel = document.getElementById(
                openButton.getAttribute("aria-controls")
              );
              openButton.setAttribute("aria-expanded", "false");
              otherAnswerPanel.classList.remove("open");
              otherAnswerPanel.style.maxHeight = "0px"; // Set to collapsed state
              otherAnswerPanel.hidden = true; // Hide immediately
            });

          // 2. Open the clicked panel (with animation)
          clickedQuestionButton.setAttribute("aria-expanded", "true");
          targetAnswerPanel.hidden = false; // Make it visible before animation
          targetAnswerPanel.classList.add("open");
          // Ensure maxHeight is 0 before calculating scrollHeight for transition
          targetAnswerPanel.style.maxHeight = "0px";

          requestAnimationFrame(() => {
            // Adding a tiny delay or another RAF can help ensure transition triggers
            // if the browser needs more time to process the 'hidden = false' and 'maxHeight = 0px'.
            // For most cases, one RAF is sufficient.
            requestAnimationFrame(() => {
              if (
                clickedQuestionButton.getAttribute("aria-expanded") === "true"
              ) {
                targetAnswerPanel.style.maxHeight =
                  targetAnswerPanel.scrollHeight + "px";
              }
            });
          });
        }
      });
    })
    .catch((error) => {
      console.error("Error loading FAQ data:", error);
      accordionContainer.innerHTML = `<div class="error-message">Could not load FAQs. ${error.message}</div>`;
    });
});

// ANIMATIONS
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  if (!animatedElements.length) {
    return;
  }

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const animationName = el.dataset.animation || "fade-in-up";
        const animationDelay = el.dataset.delay || "0s";
        const animationDuration = el.dataset.duration;

        const animationClass = `anim-${animationName}`;

        if (animationDelay) {
          el.style.animationDelay = animationDelay;
        }
        if (animationDuration) {
          el.style.animationDuration = animationDuration;
        }

        el.classList.add(animationClass);
        observer.unobserve(el); // Important: Animate only once
      }
    });
  };

  const observerOptions = {
    root: null,
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  animatedElements.forEach((el) => {
    observer.observe(el);
  });
});

// NAVBAR FOR MOBILE
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll("#mobile-menu a");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("show-mobile-menu");
      menuBtn.classList.toggle("active");
      const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", !isExpanded);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenu.classList.contains("show-mobile-menu")) {
          mobileMenu.classList.remove("show-mobile-menu");
          menuBtn.classList.remove("active");
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
    });

    document.addEventListener("click", (event) => {
      const isMenuOpen = mobileMenu.classList.contains("show-mobile-menu");
      const isClickOutsideButton = !menuBtn.contains(event.target);
      const isClickOutsideMenu = !mobileMenu.contains(event.target);

      if (isMenuOpen && isClickOutsideButton && isClickOutsideMenu) {
        mobileMenu.classList.remove("show-mobile-menu");
        menuBtn.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  } else {
    console.warn("Mobile menu button or container not found.");
  }
});

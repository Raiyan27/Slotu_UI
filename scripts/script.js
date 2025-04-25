document.addEventListener("DOMContentLoaded", () => {
  const featuresContainer = document.getElementById("features-container");
  const jsonFilePath = "/data/features.json";

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
      data.forEach((item) => {
        const featureDiv = document.createElement("div");
        featureDiv.classList.add("feature-item");
        featureDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.title}
            class="feature-item-icon">
            <h3 class="features-item-header">${item.title}</h3>
            <p class="features-item-body">${item.description}</p>
        `;
        featuresContainer.appendChild(featureDiv);
      });
    })
    .catch((error) => {
      console.error("Error loading or processing features:", error);
      featuresContainer.innerHTML = `<p class="error-message">Could not load features. ${error.message}</p>`;
    });
});

// FOR WHO SECTION
document.addEventListener("DOMContentLoaded", () => {
  const textItemsContainer = document.getElementById("for-who-text-items");
  const jsonFilePath = "/data/procrastinators.json";

  if (!textItemsContainer) {
    console.error("Error: Could not find the '#for-who-text-items' element.");
    return;
  }
  function setActiveCard(cardElement) {
    const allCards = textItemsContainer.querySelectorAll(".for-who-item-card");
    allCards.forEach((card) => card.classList.remove("active"));
    if (cardElement) {
      cardElement.classList.add("active");
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
      textItemsContainer.innerHTML = "";
      data.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("for-who-item-card");

        card.innerHTML = `
                    <h4 class="for-who-item-title">${item.title}</h4>
                    <p class="for-who-item-body">${item.description}</p>
                `;
        if (index === 0) {
          card.classList.add("active");
        }

        textItemsContainer.appendChild(card);
      });
      textItemsContainer.addEventListener("click", (event) => {
        const clickedCard = event.target.closest(".for-who-item-card");

        if (clickedCard) {
          setActiveCard(clickedCard);
        }
      });
    })
    .catch((error) => {
      console.error("Error loading or processing procrastinator data:", error);
      textItemsContainer.innerHTML = `<p class="error-message">Could not load content. ${error.message}</p>`;
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

  if (!container) {
    console.error(
      "Error: Could not find the '.testimonial-container' element."
    );
    return;
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

  function createTestimonialCard(testimonial) {
    const card = document.createElement("div");
    card.classList.add("testimonial-card");
    card.innerHTML = `
            <div class="stars" aria-label="${
              testimonial.rating
            } out of 5 stars">
                ${generateStarsHTML(testimonial.rating)}
            </div>
            <p class="testimonial-text">${testimonial.text}</p>
            <div class="profile">
                <img src="${testimonial.imageSrc}" alt="Profile picture of ${
      testimonial.name
    }" class="profile-img">
                <div class="profile-info">
                    <span class="profile-name">${testimonial.name}</span>
                    <span class="profile-title">${testimonial.title}</span>
                </div>
            </div>
        `;
    return card;
  }

  function renderTestimonials(count) {
    if (!container) return;
    container.innerHTML = "";

    const testimonialsToDisplay = allTestimonials.slice(0, count);
    testimonialsToDisplay.forEach((testimonial) => {
      const card = createTestimonialCard(testimonial);
      container.appendChild(card);
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
    const hadButtonBefore = !!loadMoreBtn;

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

        itemDiv.appendChild(button);
        itemDiv.appendChild(answerDiv);

        accordionContainer.appendChild(itemDiv);
      });

      const thirdQuestionButton = document.getElementById("faq-question-2");
      const thirdAnswerPanel = document.getElementById("faq-answer-2");

      if (thirdQuestionButton && thirdAnswerPanel) {
        thirdQuestionButton.setAttribute("aria-expanded", "true");
        thirdAnswerPanel.classList.add("open");
        thirdAnswerPanel.hidden = false;
      }

      accordionContainer.addEventListener("click", (event) => {
        const questionButton = event.target.closest(".faq-question");

        if (!questionButton) return;

        const answerPanel = document.getElementById(
          questionButton.getAttribute("aria-controls")
        );
        const isCurrentlyExpanded =
          questionButton.getAttribute("aria-expanded") === "true";

        accordionContainer.querySelectorAll(".faq-question").forEach((btn) => {
          const otherAnswer = document.getElementById(
            btn.getAttribute("aria-controls")
          );
          if (btn !== questionButton) {
            btn.setAttribute("aria-expanded", "false");
            otherAnswer.classList.remove("open");
            otherAnswer.hidden = true;
          }
        });
        if (!isCurrentlyExpanded) {
          questionButton.setAttribute("aria-expanded", "true");
          answerPanel.classList.add("open");
          answerPanel.hidden = false;
        } else {
          questionButton.setAttribute("aria-expanded", "false");
          answerPanel.classList.remove("open");
          answerPanel.hidden = true;
        }
      });
    })
    .catch((error) => {
      console.error("Error loading FAQ data:", error);
      accordionContainer.innerHTML = `<div class="error-message">Could not load FAQs. ${error.message}</div>`;
    });
});

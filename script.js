// Khushi Calibration & Testing Lab — accessible interactions and enquiry helpers
"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const header = document.querySelector(".site-header");
const backToTop = document.getElementById("backToTop");

function closeMenu() {
  navLinks?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open navigation");
}

menuButton?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const serviceSearch = document.getElementById("serviceSearch");
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const serviceCards = [...document.querySelectorAll(".service-card")];
const noResults = document.getElementById("noResults");
let activeFilter = "all";

function filterServices() {
  const query = (serviceSearch?.value || "").trim().toLowerCase();
  let visibleCount = 0;

  serviceCards.forEach((card) => {
    const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
    const textMatch = !query || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
    const visible = categoryMatch && textMatch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  noResults.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    filterServices();
  });
});
serviceSearch?.addEventListener("input", filterServices);

// Service-card links preselect the enquiry category.
document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const select = document.getElementById("serviceSelect");
    const desired = link.dataset.service;
    if (select && [...select.options].some((option) => option.value === desired || option.textContent === desired)) {
      select.value = desired;
    }
  });
});

// FAQ: keep one answer open at a time for a cleaner mobile experience.
const faqItems = [...document.querySelectorAll(".faq-item")];
faqItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

function updateScrollUI() {
  const isScrolled = window.scrollY > 260;
  header?.classList.toggle("scrolled", window.scrollY > 8);
  backToTop?.classList.toggle("show", isScrolled);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const enquiryForm = document.getElementById("enquiryForm");
const formStatus = document.getElementById("formStatus");
const copyButton = document.getElementById("copyEnquiry");

// IMPORTANT: replace this with the laboratory's confirmed email address before launch.
const LAB_EMAIL = "REPLACE-WITH-VERIFIED-EMAIL@example.com";

function getEnquiryText() {
  const data = new FormData(enquiryForm);
  return [
    "Website enquiry — Khushi Calibration & Testing Lab",
    "",
    `Name: ${data.get("name") || ""}`,
    `Company: ${data.get("company") || "Not provided"}`,
    `Email: ${data.get("email") || ""}`,
    `Phone: ${data.get("phone") || "Not provided"}`,
    `Enquiry type: ${data.get("service") || ""}`,
    "",
    "Requirement:",
    data.get("message") || ""
  ].join("\\n");
}

enquiryForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  const text = getEnquiryText();
  if (LAB_EMAIL.includes("REPLACE-WITH-VERIFIED")) {
    formStatus.textContent = "Your enquiry is ready. The laboratory's verified email address has not yet been added. Use “Copy details” to copy your enquiry.";
    return;
  }

  const subject = encodeURIComponent("Website enquiry — Khushi Calibration & Testing Lab");
  window.location.href = `mailto:${LAB_EMAIL}?subject=${subject}&body=${encodeURIComponent(text)}`;
  formStatus.textContent = "Your email app should open with the enquiry details. Please review and send the email.";
});

copyButton?.addEventListener("click", async () => {
  if (!enquiryForm.reportValidity()) {
    formStatus.textContent = "Please complete the required fields first.";
    enquiryForm.reportValidity();
    return;
  }

  try {
    await navigator.clipboard.writeText(getEnquiryText());
    formStatus.textContent = "Enquiry details copied. You can paste them into an email or message.";
  } catch (error) {
    formStatus.textContent = "Clipboard access was blocked by your browser. Select and copy the form details manually.";
  }
});

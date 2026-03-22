const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealNodes = document.querySelectorAll(".reveal");
const bookingForm = document.querySelector("#booking-form");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");
const bookingFeedback = document.querySelector("#booking-feedback");

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    header.classList.toggle("menu-open", !expanded);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!header || !navToggle) {
      return;
    }

    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealNodes.forEach((node) => observer.observe(node));

const bookingRecipient = "rayalnadan830@gmail.com,sa.shauryaarora@gmail.com";

function pad(value) {
  return String(value).padStart(2, "0");
}

function getLocalDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatSlot(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${normalizedHour}:${pad(minutes)} ${period}`;
}

function buildTimeSlots(day) {
  const isWeekend = day === 0 || day === 6;
  const startHour = isWeekend ? 9 : 16;
  const endHour = isWeekend ? 16 : 18;
  const slots = [];

  for (let hour = startHour; hour < endHour; hour += 1) {
    slots.push(formatSlot(hour, 0));
    slots.push(formatSlot(hour, 30));
  }

  return slots;
}

function setFeedback(message, state = "") {
  if (!bookingFeedback) {
    return;
  }

  bookingFeedback.textContent = message;
  bookingFeedback.classList.remove("is-error", "is-success");

  if (state) {
    bookingFeedback.classList.add(state);
  }
}

function updateAvailableTimes() {
  if (!bookingDate || !bookingTime) {
    return;
  }

  const value = bookingDate.value;
  bookingTime.innerHTML = "";

  if (!value) {
    bookingTime.disabled = true;
    bookingTime.innerHTML = '<option value="">Select a date first</option>';
    return;
  }

  const selectedDate = new Date(`${value}T12:00:00`);
  const selectedDay = selectedDate.getDay();
  const slots = buildTimeSlots(selectedDay);

  bookingTime.disabled = false;
  bookingTime.innerHTML = '<option value="">Select a time</option>';

  slots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    bookingTime.appendChild(option);
  });

  setFeedback("");
}

if (bookingDate) {
  const today = new Date();
  bookingDate.min = getLocalDateString(today);
  bookingDate.addEventListener("change", updateAvailableTimes);
}

if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!bookingDate || !bookingTime) {
      return;
    }

    const formData = new FormData(bookingForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const vehicleType = String(formData.get("vehicleType") || "").trim();
    const packageType = String(formData.get("package") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const time = String(formData.get("time") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!name || !email || !phone || !vehicleType || !packageType || !date || !time) {
      setFeedback("Fill out every required field before sending the booking email.", "is-error");
      return;
    }

    const selectedDay = new Date(`${date}T12:00:00`).getDay();
    const validSlots = buildTimeSlots(selectedDay);

    if (!validSlots.includes(time)) {
      setFeedback("Choose a valid available time for the selected date.", "is-error");
      return;
    }

    const subject = encodeURIComponent(`New Trinity Auto Detail Booking - ${name}`);
    const body = encodeURIComponent(
      [
        "New booking request",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Vehicle Type: ${vehicleType}`,
        `Package: ${packageType}`,
        `Preferred Date: ${date}`,
        `Preferred Time: ${time}`,
        "",
        "Notes / Vehicle Condition:",
        notes || "None provided",
        "",
        "Reminder: Prices may vary based on vehicle condition and travel fee may apply."
      ].join("\n")
    );

    setFeedback("Opening your email app with the booking details filled in.", "is-success");
    window.location.href = `mailto:${bookingRecipient}?subject=${subject}&body=${body}`;
  });
}

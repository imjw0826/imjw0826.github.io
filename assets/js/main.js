(() => {
  const notesGrid = document.querySelector("#notes-grid");
  const topicFilter = document.querySelector("#topic-filter");
  const navToggle = document.querySelector(".nav-toggle");
  const navigationMenu = document.querySelector("#navigation-menu");

  const toggleNavigation = () => {
    if (!navToggle || !navigationMenu) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navigationMenu.classList.toggle("open", !isOpen);
  };

  if (navToggle && navigationMenu) {
    navToggle.addEventListener("click", toggleNavigation);
    navigationMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        if (window.innerWidth < 768) {
          toggleNavigation();
        }
      })
    );
  }

  const renderNotes = (notes, filter) => {
    if (!notesGrid) return;
    notesGrid.innerHTML = "";

    const filtered =
      filter && filter !== "all"
        ? notes.filter((note) =>
            note.topics.some(
              (topic) => topic.toLowerCase() === filter.toLowerCase()
            )
          )
        : notes;

    if (!filtered.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent =
        "No notes match that topic yet. Try a different filter.";
      notesGrid.appendChild(emptyState);
      return;
    }

    filtered.forEach((note) => {
      const card = document.createElement("article");
      card.className = "note-card";
      card.innerHTML = `
        <header>
          <p class="note-subject">${note.subject}</p>
          <h3>${note.title}</h3>
        </header>
        <p>${note.summary}</p>
        <ul class="note-topics">
          ${note.topics.map((topic) => `<li>${topic}</li>`).join("")}
        </ul>
        <div class="note-meta">
          <span>Updated: ${new Date(note.updated).toLocaleDateString()}</span>
          <a class="button tertiary" href="${note.url}" target="_blank" rel="noreferrer">
            Open file
          </a>
        </div>
      `;
      notesGrid.appendChild(card);
    });
  };

  const populateFilters = (notes) => {
    if (!topicFilter) return;
    const topics = new Set();
    notes.forEach((note) =>
      note.topics.forEach((topic) => topics.add(topic.trim()))
    );

    Array.from(topics)
      .sort((a, b) => a.localeCompare(b))
      .forEach((topic) => {
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        topicFilter.appendChild(option);
      });

    topicFilter.addEventListener("change", (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        renderNotes(notes, target.value);
      }
    });
  };

  fetch("assets/data/notes.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load notes (${response.status})`);
      }
      return response.json();
    })
    .then((notes) => {
      renderNotes(notes);
      populateFilters(notes);
    })
    .catch(() => {
      if (!notesGrid) return;
      const error = document.createElement("p");
      error.className = "empty-state";
      error.textContent =
        "Unable to load notes right now. Please refresh the page or check back later.";
      notesGrid.appendChild(error);
    });

  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  const yearElement = document.querySelector("#year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();

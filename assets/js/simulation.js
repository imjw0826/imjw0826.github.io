(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#simulation-menu");

  const toggleNavigation = () => {
    if (!navToggle || !navMenu) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("open", !isOpen);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", toggleNavigation);
    navMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        if (window.innerWidth < 768) {
          toggleNavigation();
        }
      })
    );
  }

  const scoreElements = {
    my: document.querySelector("#score-my"),
    opposite: document.querySelector("#score-opposite"),
  };

  const areas = {
    my: document.querySelector('[data-zone="my-items"]'),
    opposite: document.querySelector('[data-zone="opposite-items"]'),
    pit: document.querySelector('[data-zone="pit-items"]'),
    "my-bin": document.querySelector('[data-zone="my-bin"]'),
    "opposite-bin": document.querySelector('[data-zone="opposite-bin"]'),
  };

  const openGrid = document.querySelector("#open-grid");
  const openSlotElements = new Map();
  const historyStack = [];
  let draggedItemId = null;
  let allItems = new Map();
  let spoilerSets = [];

  const scores = {
    my: 0,
    opposite: 0,
  };

  const transferPoints = {
    helmet: 4,
    jerrycan: 4,
    wing: 6,
    tire: 16,
    spoiler: 0,
  };

  const tapPoints = {
    helmet: 2,
    jerrycan: 2,
    wing: 2,
    tire: 4,
    spoiler: 2,
  };

  const spoilerPointLevels = {
    single: 3,
    pair: 8,
    assemble: 20,
  };

  const openGridLayout = [
    {
      slots: [
        "slot-my-helmet-1",
        "slot-my-helmet-2",
        "slot-my-jerrycan-1",
        "slot-my-jerrycan-2",
        "slot-my-wing-1",
        "slot-my-wing-2",
        "slot-my-tire-1",
      ],
    },
    {
      slots: [
        "slot-right-spoiler-1",
        "slot-right-spoiler-2",
        "slot-right-spoiler-3",
        "slot-my-tire-2",
        "slot-opposite-tire-2",
      ],
    },
    {
      slots: [
        "slot-left-spoiler-1",
        "slot-left-spoiler-2",
        "slot-left-spoiler-3",
        "slot-my-tire-3",
        "slot-opposite-tire-3",
      ],
    },
    {
      slots: [
        "slot-opposite-helmet-1",
        "slot-opposite-helmet-2",
        "slot-opposite-jerrycan-1",
        "slot-opposite-jerrycan-2",
        "slot-opposite-wing-1",
        "slot-opposite-wing-2",
        "slot-opposite-tire-1",
      ],
    },
  ];

  const gearConfigs = [
    {
      team: "my",
      type: "helmet",
      label: "Helmet",
      short: "H",
      slots: ["slot-my-helmet-1", "slot-my-helmet-2"],
    },
    {
      team: "my",
      type: "jerrycan",
      label: "Jerrycan",
      short: "J",
      slots: ["slot-my-jerrycan-1", "slot-my-jerrycan-2"],
    },
    {
      team: "my",
      type: "wing",
      label: "Front Wing",
      short: "F",
      slots: ["slot-my-wing-1", "slot-my-wing-2"],
    },
    {
      team: "my",
      type: "tire",
      label: "Tire",
      short: "T",
      slots: ["slot-my-tire-1", "slot-my-tire-2", "slot-my-tire-3"],
    },
    {
      team: "opposite",
      type: "helmet",
      label: "Helmet",
      short: "H",
      slots: ["slot-opposite-helmet-1", "slot-opposite-helmet-2"],
    },
    {
      team: "opposite",
      type: "jerrycan",
      label: "Jerrycan",
      short: "J",
      slots: ["slot-opposite-jerrycan-1", "slot-opposite-jerrycan-2"],
    },
    {
      team: "opposite",
      type: "wing",
      label: "Front Wing",
      short: "F",
      slots: ["slot-opposite-wing-1", "slot-opposite-wing-2"],
    },
    {
      team: "opposite",
      type: "tire",
      label: "Tire",
      short: "T",
      slots: ["slot-opposite-tire-1", "slot-opposite-tire-2", "slot-opposite-tire-3"],
    },
  ];

  const spoilerLeftSlots = [
    "slot-left-spoiler-1",
    "slot-left-spoiler-2",
    "slot-left-spoiler-3",
  ];

  const spoilerRightSlots = [
    "slot-right-spoiler-1",
    "slot-right-spoiler-2",
    "slot-right-spoiler-3",
  ];

  const buildOpenGrid = () => {
    if (!openGrid) return;
    openGrid.innerHTML = "";
    openGridLayout.forEach((column) => {
      const columnElement = document.createElement("div");
      columnElement.className = "open-column";
      openGrid.appendChild(columnElement);
      column.slots.forEach((slotId) => {
        const slot = document.createElement("div");
        slot.className = "open-slot empty";
        slot.dataset.slotId = slotId;
        slot.dataset.dropZone = "open";
        openSlotElements.set(slotId, slot);
        columnElement.appendChild(slot);
      });
    });
  };

  const updateScoreDisplay = () => {
    Object.entries(scoreElements).forEach(([team, element]) => {
      if (element) {
        element.textContent = String(scores[team]);
      }
    });
  };

  const addScore = (team, amount) => {
    if (!team || amount === 0) return;
    scores[team] = (scores[team] || 0) + amount;
    updateScoreDisplay();
  };

  const owningTeam = (owner) => {
    if (owner === "my" || owner === "opposite") return owner;
    if (owner === "my-bin") return "my";
    if (owner === "opposite-bin") return "opposite";
    return null;
  };

  const setupGearItems = () => {
    gearConfigs.forEach((config) => {
      config.slots.forEach((slotId, index) => {
        const id = `${config.team}-${config.type}-${index + 1}`;
        const item = {
          id,
          type: config.type,
          owner: "open",
          label: config.label,
          short: `${config.short}${index + 1}`,
          category: "gear",
          slot: slotId,
          homeTeam: config.team,
          locked: false,
        };
        allItems.set(id, item);
      });
    });
  };

  const setupSpoilers = () => {
    const sets = [];
    for (let index = 0; index < 3; index += 1) {
      const setId = `spoiler-set-${index + 1}`;
      const set = {
        id: setId,
        label: `Set ${index + 1}`,
        assembledBy: null,
        locked: false,
        awards: { my: 0, opposite: 0 },
        pieces: [],
      };

      const leftId = `spoiler-${index + 1}-left`;
      const rightId = `spoiler-${index + 1}-right`;

      const leftPiece = {
        id: leftId,
        type: "spoiler",
        owner: "open",
        label: `Spoiler ${index + 1} Left`,
        short: `L${index + 1}`,
        category: "spoiler",
        side: "left",
        slot: spoilerLeftSlots[index],
        setId,
        locked: false,
      };

      const rightPiece = {
        id: rightId,
        type: "spoiler",
        owner: "open",
        label: `Spoiler ${index + 1} Right`,
        short: `R${index + 1}`,
        category: "spoiler",
        side: "right",
        slot: spoilerRightSlots[index],
        setId,
        locked: false,
      };

      set.pieces.push(leftId, rightId);
      allItems.set(leftId, leftPiece);
      allItems.set(rightId, rightPiece);
      sets.push(set);
    }
    return sets;
  };

  const clearOpenSlots = () => {
    openSlotElements.forEach((slot) => {
      slot.innerHTML = "";
      slot.classList.add("empty");
    });
  };

  const createItemElement = (item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `object-token ${item.type} owner-${item.owner}`;
    button.dataset.itemId = item.id;
    button.draggable = !item.locked && !item.owner.endsWith("-bin");

    const label = document.createElement("span");
    label.textContent = item.label;
    const strong = document.createElement("strong");
    strong.textContent = item.short;

    button.appendChild(label);
    button.appendChild(strong);

    button.addEventListener("click", () => {
      if (item.owner === "my" || item.owner === "opposite") {
        sendToBin(item);
      }
    });

    button.addEventListener("dragstart", handleDragStart);
    button.addEventListener("dragend", handleDragEnd);

    return button;
  };

  const renderEquipment = () => {
    Object.values(areas).forEach((area) => {
      if (area) {
        area.innerHTML = "";
      }
    });
    clearOpenSlots();

    allItems.forEach((item) => {
      const element = createItemElement(item);
      if (item.owner === "open") {
        const slot = openSlotElements.get(item.slot || "");
        if (slot) {
          slot.innerHTML = "";
          slot.appendChild(element);
          slot.classList.remove("empty");
        }
        return;
      }

      const targetArea = areas[item.owner] || areas.pit;
      if (targetArea) {
        targetArea.appendChild(element);
      }
    });
  };

  const addSnapshot = () => {
    const snapshot = {
      scores: { ...scores },
      items: Array.from(allItems.values()).map((item) => ({ ...item })),
      sets: spoilerSets.map((set) => ({
        ...set,
        awards: { ...set.awards },
        pieces: [...set.pieces],
      })),
    };
    historyStack.push(snapshot);
    if (historyStack.length > 50) {
      historyStack.shift();
    }
  };

  const restoreSnapshot = (snapshot) => {
    scores.my = snapshot.scores.my;
    scores.opposite = snapshot.scores.opposite;
    allItems = new Map(snapshot.items.map((item) => [item.id, { ...item }]));
    spoilerSets = snapshot.sets.map((set) => ({
      ...set,
      awards: { ...set.awards },
      pieces: [...set.pieces],
    }));
    updateScoreDisplay();
    renderEquipment();
    renderSpoilerStatus();
  };

  const undoLastMove = () => {
    const snapshot = historyStack.pop();
    if (!snapshot) return;
    restoreSnapshot(snapshot);
  };

  const addDropZoneHighlights = (target) => {
    document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
      zone.classList.toggle("drop-zone-active", zone === target);
    });
  };

  const clearDropZoneHighlights = () => {
    document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
      zone.classList.remove("drop-zone-active");
    });
  };

  const handleDragStart = (event) => {
    const token = event.currentTarget;
    const itemId = token.dataset.itemId;
    const item = allItems.get(itemId);
    if (!item || item.locked || item.owner.endsWith("-bin")) {
      event.preventDefault();
      return;
    }
    draggedItemId = itemId;
    token.classList.add("dragging");
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", itemId);
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = (event) => {
    event.currentTarget.classList.remove("dragging");
    draggedItemId = null;
    clearDropZoneHighlights();
  };

  const canAcceptDrop = (zone, item) => {
    if (!item || item.locked || item.owner.endsWith("-bin")) return false;
    if (zone === "open") return true;
    if (zone === "pit") return item.category === "spoiler";
    if (zone === "my" || zone === "opposite") return true;
    return false;
  };

  const handleDragOver = (event) => {
    if (!draggedItemId) return;
    const zoneElement = event.target.closest("[data-drop-zone]");
    if (!zoneElement) return;
    const item = allItems.get(draggedItemId);
    if (!canAcceptDrop(zoneElement.dataset.dropZone, item)) return;
    event.preventDefault();
    addDropZoneHighlights(zoneElement);
  };

  const handleDrop = (event) => {
    if (!draggedItemId) return;
    const zoneElement = event.target.closest("[data-drop-zone]");
    if (!zoneElement) return;
    const zone = zoneElement.dataset.dropZone;
    const item = allItems.get(draggedItemId);
    if (!canAcceptDrop(zone, item)) return;
    event.preventDefault();
    performDrop(item, zone);
    clearDropZoneHighlights();
    draggedItemId = null;
  };

  const awardTapPoints = (team, type) => {
    if (!team) return;
    addScore(team, tapPoints[type] || 0);
  };

  const moveGeneralItem = (item, destination) => {
    const releasingTeam = owningTeam(item.owner);

    if (destination === "open") {
      item.owner = "open";
      item.locked = false;
      return;
    }

    if (destination !== "my" && destination !== "opposite") return;
    if (item.owner === destination) return;

    if (releasingTeam && releasingTeam !== destination) {
      awardTapPoints(releasingTeam, item.type);
    }

    item.owner = destination;
    item.locked = false;
    addScore(destination, transferPoints[item.type] || 0);
  };

  const recalculateSpoilerBonuses = () => {
    spoilerSets.forEach((set) => {
      ["my", "opposite"].forEach((team) => {
        let nextAward = 0;
        if (set.assembledBy === team) {
          nextAward = spoilerPointLevels.assemble;
        } else {
          const pieces = set.pieces.map((pieceId) => allItems.get(pieceId));
          const teamPieces = pieces.filter((piece) => piece?.owner === team);
          const hasLeft = teamPieces.some((piece) => piece?.side === "left");
          const hasRight = teamPieces.some((piece) => piece?.side === "right");
          if (hasLeft && hasRight) {
            nextAward = spoilerPointLevels.pair;
          } else if (teamPieces.length > 0) {
            nextAward = spoilerPointLevels.single;
          }
        }

        const delta = nextAward - (set.awards[team] || 0);
        if (delta !== 0) {
          addScore(team, delta);
          set.awards[team] = nextAward;
        }
      });
    });
  };

  const moveSpoilerItem = (item, destination) => {
    const releasingTeam = owningTeam(item.owner);

    if (destination === "open" || destination === "pit") {
      item.owner = destination;
      item.locked = false;
      recalculateSpoilerBonuses();
      return;
    }

    if (destination !== "my" && destination !== "opposite") return;
    if (item.owner === destination) return;

    if (releasingTeam && releasingTeam !== destination) {
      awardTapPoints(releasingTeam, item.type);
    }

    item.owner = destination;
    item.locked = false;
    recalculateSpoilerBonuses();
  };

  const performDrop = (item, destination) => {
    if (destination === item.owner) return;
    if (destination === "open" && item.owner === "open") return;
    addSnapshot();
    if (item.category === "spoiler") {
      moveSpoilerItem(item, destination);
    } else {
      moveGeneralItem(item, destination);
    }
    renderEquipment();
    renderSpoilerStatus();
  };

  const sendToBin = (item) => {
    const team = owningTeam(item.owner);
    if (!team || item.locked) return;
    addSnapshot();
    item.owner = `${team}-bin`;
    item.locked = true;
    awardTapPoints(team, item.type);
    if (item.category === "spoiler") {
      recalculateSpoilerBonuses();
    }
    renderEquipment();
    renderSpoilerStatus();
  };

  const getSpoilerSet = (setId) => spoilerSets.find((set) => set.id === setId);

  const canAssembleSet = (set) => {
    if (!set || set.assembledBy) return null;
    const owners = set.pieces.map((pieceId) => allItems.get(pieceId)?.owner);
    const uniqueOwners = new Set(owners);
    if (uniqueOwners.size === 1 && (uniqueOwners.has("my") || uniqueOwners.has("opposite"))) {
      return owners[0];
    }
    return null;
  };

  const assembleSet = (setId) => {
    const set = getSpoilerSet(setId);
    const team = canAssembleSet(set);
    if (!set || !team) return;
    addSnapshot();
    set.assembledBy = team;
    set.locked = true;
    set.pieces.forEach((pieceId) => {
      const piece = allItems.get(pieceId);
      if (piece) {
        piece.owner = team;
        piece.locked = true;
      }
    });
    const previousAward = set.awards[team] || 0;
    const assembleAward = spoilerPointLevels.assemble;
    if (assembleAward > previousAward) {
      addScore(team, assembleAward - previousAward);
    }
    set.awards[team] = assembleAward;
    recalculateSpoilerBonuses();
    renderEquipment();
    renderSpoilerStatus();
  };

  const renderSpoilerStatus = () => {
    const root = document.querySelector("#spoiler-status");
    if (!root) return;
    root.innerHTML = "";

    spoilerSets.forEach((set) => {
      const card = document.createElement("div");
      card.className = "spoiler-card";
      const header = document.createElement("header");
      const title = document.createElement("h4");
      title.textContent = set.label;
      header.appendChild(title);

      if (set.assembledBy) {
        const badge = document.createElement("span");
        badge.className = "spoiler-badge assembled";
        badge.textContent = `Assembled · ${set.assembledBy === "my" ? "My Team" : "Opposite"}`;
        header.appendChild(badge);
      } else {
        const readyTeam = canAssembleSet(set);
        if (readyTeam) {
          const badge = document.createElement("span");
          badge.className = "spoiler-badge ready";
          badge.textContent = `${readyTeam === "my" ? "My Team" : "Opposite"} can assemble`;
          header.appendChild(badge);
        }
      }

      card.appendChild(header);

      const summary = document.createElement("p");
      const counts = { my: 0, neutral: 0, opposite: 0 };
      set.pieces.forEach((pieceId) => {
        const piece = allItems.get(pieceId);
        const team = owningTeam(piece?.owner);
        if (team === "my") {
          counts.my += 1;
        } else if (team === "opposite") {
          counts.opposite += 1;
        } else {
          counts.neutral += 1;
        }
      });
      summary.textContent = `My ${counts.my} · Neutral ${counts.neutral} · Opposite ${counts.opposite}`;
      card.appendChild(summary);

      if (!set.assembledBy) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "assemble-btn";
        const readyTeam = canAssembleSet(set);
        button.textContent = readyTeam
          ? `Assemble for ${spoilerPointLevels.assemble} pts`
          : "Need both halves on one team";
        button.disabled = !readyTeam;
        if (readyTeam) {
          button.addEventListener("click", () => assembleSet(set.id));
        }
        card.appendChild(button);
      }

      root.appendChild(card);
    });
  };

  const initializeState = () => {
    allItems = new Map();
    spoilerSets = [];
    historyStack.length = 0;
    scores.my = 0;
    scores.opposite = 0;
    setupGearItems();
    spoilerSets = setupSpoilers();
    recalculateSpoilerBonuses();
    updateScoreDisplay();
    renderEquipment();
    renderSpoilerStatus();
  };

  const resetButton = document.querySelector("#reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      initializeState();
      clearDropZoneHighlights();
    });
  }

  const backButton = document.querySelector("#back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      undoLastMove();
    });
  }

  document.addEventListener("dragover", handleDragOver);
  document.addEventListener("drop", handleDrop);

  const yearElement = document.querySelector("#sim-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  buildOpenGrid();
  initializeState();
})();

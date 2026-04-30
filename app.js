import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const STORAGE_KEY = "to-tea-or-not-to-tea.entries";

const starterEntries = [
  {
    id: "entry-1",
    flavor: "Peach",
    location: "The Corner Cafe",
    drinkName: "Sunset Peach Iced Tea",
    rating: 5,
    thoughts:
      "Super juicy and bright with a mellow black tea base. Tasted like peach rings in the best way.",
    createdAt: "2026-04-28T16:00:00.000Z",
  },
  {
    id: "entry-2",
    flavor: "Passionfruit",
    location: "Bubble Stop",
    drinkName: "Passionfruit Green Tea",
    rating: 4,
    thoughts:
      "Tangy, tropical, and really refreshing. A little sweet, but the citrus edge balanced it out.",
    createdAt: "2026-04-27T12:30:00.000Z",
  },
  {
    id: "entry-3",
    flavor: "Lemon",
    location: "Picnic Market",
    drinkName: "Sparkling Lemon Iced Tea",
    rating: 3,
    thoughts:
      "Crisp and fizzy with a strong lemon finish. Good for hot days, but I wanted a little more tea flavor.",
    createdAt: "2026-04-25T10:15:00.000Z",
  },
];

const flavorThemes = {
  peach: {
    accent: "peach",
    fruit: "🍑",
    pattern: "peach-pattern",
  },
  passionfruit: {
    accent: "passionfruit",
    fruit: "🥭",
    pattern: "passionfruit-pattern",
  },
  lemon: {
    accent: "lemon",
    fruit: "🍋",
    pattern: "lemon-pattern",
  },
  strawberry: {
    accent: "berry",
    fruit: "🍓",
    pattern: "berry-pattern",
  },
  raspberry: {
    accent: "berry",
    fruit: "🫐",
    pattern: "berry-pattern",
  },
  berry: {
    accent: "berry",
    fruit: "🫐",
    pattern: "berry-pattern",
  },
  mint: {
    accent: "mint",
    fruit: "🌿",
    pattern: "mint-pattern",
  },
  mango: {
    accent: "mango",
    fruit: "🥭",
    pattern: "mango-pattern",
  },
};

const stickers = [
  { src: "./assets/reference/sticker-berry-left.png", alt: "Berry sticker", className: "sticker sticker-berry-left" },
  { src: "./assets/reference/sticker-strawberry-left.png", alt: "Strawberry sticker", className: "sticker sticker-strawberry-left" },
  { src: "./assets/reference/sticker-peach-left.png", alt: "Peach sticker", className: "sticker sticker-peach-left" },
  { src: "./assets/reference/sticker-blueberry-right.png", alt: "Blueberry sticker", className: "sticker sticker-blueberry-right" },
  { src: "./assets/reference/sticker-raspberry-right.png", alt: "Raspberry sticker", className: "sticker sticker-raspberry-right" },
  { src: "./assets/reference/sticker-lemon-right.png", alt: "Lemon sticker", className: "sticker sticker-lemon-right" },
];

function normalizeFlavor(flavor) {
  return flavor.trim().replace(/\s+/g, " ");
}

function formatFlavorKey(flavor) {
  return normalizeFlavor(flavor).toLowerCase();
}

function emptyForm() {
  return {
    flavor: "",
    location: "",
    drinkName: "",
    rating: 5,
    thoughts: "",
  };
}

function toEntryDraft(entry) {
  return {
    flavor: entry.flavor,
    location: entry.location,
    drinkName: entry.drinkName,
    rating: entry.rating,
    thoughts: entry.thoughts,
  };
}

function validateDraft(draft) {
  return (
    normalizeFlavor(draft.flavor) &&
    draft.location.trim() &&
    draft.drinkName.trim() &&
    draft.thoughts.trim() &&
    draft.rating >= 1 &&
    draft.rating <= 5
  );
}

function groupEntries(entries) {
  return entries.reduce((groups, entry) => {
    const flavorName = normalizeFlavor(entry.flavor);
    if (!groups[flavorName]) {
      groups[flavorName] = [];
    }
    groups[flavorName].push(entry);
    return groups;
  }, {});
}

function sortFlavorNames(names) {
  return [...names].sort((left, right) => left.localeCompare(right));
}

function resolveTheme(flavor) {
  return flavorThemes[formatFlavorKey(flavor)] || { accent: "signature", fruit: "🧋", pattern: "signature-pattern" };
}

function StarDisplay({ rating, interactive = false, onChange }) {
  return React.createElement(
    "div",
    {
      className: interactive ? "star-row star-row-interactive" : "star-row",
      role: interactive ? "radiogroup" : undefined,
      "aria-label": `${rating} out of 5 stars`,
    },
    Array.from({ length: 5 }, (_, index) => {
      const value = index + 1;
      const active = value <= rating;

      if (!interactive) {
        return React.createElement(
          "span",
          {
            key: value,
            className: active ? "star active" : "star",
            "aria-hidden": true,
          },
          "★"
        );
      }

      return React.createElement(
        "button",
        {
          key: value,
          type: "button",
          className: active ? "star-button active" : "star-button",
          onClick: () => onChange(value),
          role: "radio",
          "aria-checked": rating === value,
          "aria-label": `${value} star${value > 1 ? "s" : ""}`,
        },
        "★"
      );
    })
  );
}

function Loader() {
  return React.createElement(
    "div",
    { className: "loader-screen", role: "status", "aria-live": "polite" },
    React.createElement(
      "div",
      { className: "tea-swirl-stage" },
      React.createElement("div", { className: "glass-rim" }),
      React.createElement(
        "div",
        { className: "tea-swirl" },
        React.createElement("div", { className: "tea-swirl-liquid" }),
        React.createElement("div", { className: "tea-swirl-ripple ripple-one" }),
        React.createElement("div", { className: "tea-swirl-ripple ripple-two" }),
        React.createElement("div", { className: "tea-swirl-highlight" }),
        React.createElement("div", { className: "ice-cube cube-one" }),
        React.createElement("div", { className: "ice-cube cube-two" }),
        React.createElement("div", { className: "ice-cube cube-three" }),
        React.createElement("div", { className: "ice-cube cube-four" })
      )
    )
  );
}

function ReviewBubble({ entry, isEditing, editForm, onStartEdit, onCancelEdit, onSaveEdit, onEditChange }) {
  const liveEntry = isEditing ? { ...entry, ...editForm } : entry;
  const theme = resolveTheme(liveEntry.flavor);

  if (isEditing) {
    return React.createElement(
      "article",
      { className: "review-card review-card-editing", "data-accent": theme.accent },
      React.createElement("div", { className: `card-pattern ${theme.pattern}` }),
      React.createElement(
        "div",
        { className: "card-body" },
        React.createElement(
          "div",
          { className: "edit-grid" },
          React.createElement(
            "label",
            { className: "edit-wide" },
            React.createElement("span", null, "Flavor"),
            React.createElement("input", {
              type: "text",
              name: "flavor",
              value: editForm.flavor,
              onChange: onEditChange,
            })
          ),
          React.createElement(
            "label",
            { className: "edit-wide" },
            React.createElement("span", null, "Location"),
            React.createElement("input", {
              type: "text",
              name: "location",
              value: editForm.location,
              onChange: onEditChange,
            })
          ),
          React.createElement(
            "label",
            { className: "edit-wide" },
            React.createElement("span", null, "Drink name"),
            React.createElement("input", {
              type: "text",
              name: "drinkName",
              value: editForm.drinkName,
              onChange: onEditChange,
            })
          ),
          React.createElement(
            "div",
            { className: "bubble-rating-box edit-wide" },
            React.createElement("span", null, "Overall rating"),
            React.createElement(StarDisplay, {
              rating: editForm.rating,
              interactive: true,
              onChange: (value) => onEditChange({ target: { name: "rating", value } }),
            })
          ),
          React.createElement(
            "label",
            { className: "edit-wide" },
            React.createElement("span", null, "Thoughts"),
            React.createElement("textarea", {
              name: "thoughts",
              rows: 4,
              value: editForm.thoughts,
              onChange: onEditChange,
            })
          )
        ),
        React.createElement(
          "div",
          { className: "bubble-actions" },
          React.createElement(
            "button",
            { className: "bubble-button bubble-button-ghost", type: "button", onClick: onCancelEdit },
            "Cancel"
          ),
          React.createElement(
            "button",
            { className: "bubble-button", type: "button", onClick: onSaveEdit, disabled: !validateDraft(editForm) },
            "Save"
          )
        )
      )
    );
  }

  return React.createElement(
    "article",
    { className: "review-card", "data-accent": theme.accent },
    React.createElement("div", { className: `card-pattern ${theme.pattern}` }),
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement("h3", { className: "card-title" }, entry.drinkName),
      React.createElement("p", { className: "card-location" }, entry.location.toUpperCase()),
      React.createElement(StarDisplay, { rating: entry.rating }),
      React.createElement("p", { className: "card-thoughts" }, entry.thoughts),
      React.createElement(
        "button",
        { className: "edit-pill", type: "button", onClick: onStartEdit },
        "Edit"
      )
    )
  );
}

function App() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm());

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsedEntries = JSON.parse(stored);
          setEntries(Array.isArray(parsedEntries) && parsedEntries.length > 0 ? parsedEntries : starterEntries);
        } catch {
          setEntries(starterEntries);
        }
      } else {
        setEntries(starterEntries);
      }
      setIsLoading(false);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  const grouped = useMemo(() => groupEntries(entries), [entries]);
  const flavorNames = useMemo(() => sortFlavorNames(Object.keys(grouped)), [grouped]);
  const orderedEntries = useMemo(
    () =>
      flavorNames.flatMap((flavor) =>
        grouped[flavor]
          .slice()
          .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      ),
    [flavorNames, grouped]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
  }

  function submitEntry(event) {
    event.preventDefault();
    if (!validateDraft(form)) {
      return;
    }

    const nextEntry = {
      id: `entry-${Date.now()}`,
      flavor: normalizeFlavor(form.flavor),
      location: form.location.trim(),
      drinkName: form.drinkName.trim(),
      rating: Number(form.rating),
      thoughts: form.thoughts.trim(),
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [nextEntry, ...current]);
    setForm(emptyForm());
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setEditForm(toEntryDraft(entry));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  function updateEditField(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
  }

  function saveEdit(entryId) {
    if (!validateDraft(editForm)) {
      return;
    }

    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              flavor: normalizeFlavor(editForm.flavor),
              location: editForm.location.trim(),
              drinkName: editForm.drinkName.trim(),
              rating: Number(editForm.rating),
              thoughts: editForm.thoughts.trim(),
            }
          : entry
      )
    );

    cancelEdit();
  }

  if (isLoading) {
    return React.createElement(Loader);
  }

  return React.createElement(
    "main",
    { className: "design-shell" },
    React.createElement(
      "section",
      { className: "hero-section" },
      React.createElement(
        "div",
        { className: "hero-copy" },
        React.createElement("h1", null, "To Tea or", React.createElement("br"), "Not to Tea"),
        React.createElement(
          "p",
          null,
          "A bright little home for every iced tea crush,",
          React.createElement("br"),
          "surprise favorite, and politely disappointing sip."
        )
      ),
      React.createElement(
        "div",
        { className: "top-illustration" },
        React.createElement("img", {
          className: "desk-illustration",
          src: "./assets/reference/desk.png",
          alt: "Desk illustration with plant, tea cup, and radio",
        })
      )
    ),
    React.createElement(
      "div",
      { className: "fruit-splash-band", "aria-hidden": true },
      React.createElement("img", {
        className: "fruit-band-piece fruit-band-left",
        src: "./assets/reference/fruit-band-left.png",
        alt: "",
      }),
      React.createElement("img", {
        className: "fruit-band-piece fruit-band-right",
        src: "./assets/reference/fruit-band-right.png",
        alt: "",
      }),
      React.createElement("img", {
        className: "fruit-band-center-sticker",
        src: "./assets/reference/sticker-strawberry-left.png",
        alt: "",
      })
    ),
    React.createElement(
      "section",
      { className: "composer-wrap" },
      React.createElement(
        "div",
        { className: "composer-card" },
        React.createElement("h2", null, "Add a fresh tea bubble"),
        React.createElement(
          "form",
          { className: "tea-form", onSubmit: submitEntry },
          React.createElement("input", {
            type: "text",
            name: "flavor",
            placeholder: "Flavor (e.g., Peach, passionfruit)",
            value: form.flavor,
            onChange: updateField,
            required: true,
          }),
          React.createElement("input", {
            type: "text",
            name: "location",
            placeholder: "Location (e.g., Where did you get it?)",
            value: form.location,
            onChange: updateField,
            required: true,
          }),
          React.createElement("input", {
            type: "text",
            name: "drinkName",
            placeholder: "Drink name (e.g., What was it called?)",
            value: form.drinkName,
            onChange: updateField,
            required: true,
          }),
          React.createElement(
            "div",
            { className: "rating-block" },
            React.createElement("span", null, "Overall rating"),
            React.createElement(StarDisplay, {
              rating: form.rating,
              interactive: true,
              onChange: (value) => setForm((current) => ({ ...current, rating: value })),
            })
          ),
          React.createElement("textarea", {
            name: "thoughts",
            rows: 5,
            placeholder: "Thoughts",
            value: form.thoughts,
            onChange: updateField,
            required: true,
          }),
          React.createElement(
            "button",
            { className: "submit-button", type: "submit", disabled: !validateDraft(form) },
            "Log My Sip"
          )
        )
      ),
      stickers.map((item) =>
        React.createElement("img", {
          key: item.className,
          className: item.className,
          src: item.src,
          alt: item.alt,
        })
      )
    ),
    React.createElement(
      "section",
      { className: "flavor-board-section" },
      React.createElement("h2", { className: "board-title" }, "The Flavor Board"),
      React.createElement(
        "div",
        { className: "review-grid" },
        orderedEntries.map((entry) =>
          React.createElement(ReviewBubble, {
            key: entry.id,
            entry,
            isEditing: editingId === entry.id,
            editForm,
            onStartEdit: () => startEdit(entry),
            onCancelEdit: cancelEdit,
            onSaveEdit: () => saveEdit(entry.id),
            onEditChange: updateEditField,
          })
        )
      )
    )
  );
}

createRoot(document.getElementById("root")).render(React.createElement(App));

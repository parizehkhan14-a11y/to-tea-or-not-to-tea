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
  peach: { accent: "peach", note: "Juicy orchard energy" },
  passionfruit: { accent: "passionfruit", note: "Tangy tropical glow" },
  lemon: { accent: "lemon", note: "Zesty citrus sparkle" },
  strawberry: { accent: "berry", note: "Candy-bright berry pop" },
  raspberry: { accent: "berry", note: "Berry jam brightness" },
  berry: { accent: "berry", note: "Mixed berry sweetness" },
  mint: { accent: "mint", note: "Cool garden freshness" },
  mango: { accent: "mango", note: "Golden fruit rush" },
  lychee: { accent: "lychee", note: "Soft floral sweetness" },
};

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
  return flavorThemes[formatFlavorKey(flavor)] || { accent: "signature", note: "House special pour" };
}

function StarDisplay({ rating, interactive = false, onChange }) {
  return React.createElement(
    "div",
    {
      className: interactive ? "star-row star-row-interactive" : "star-row",
      "aria-label": `${rating} out of 5 stars`,
      role: interactive ? "radiogroup" : undefined,
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
          "\u2605"
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
        "\u2605"
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
    ),
    React.createElement("p", { className: "loader-copy" }, "Steeping your latest sips...")
  );
}

function ReviewBubble({ entry, isEditing, editForm, onStartEdit, onCancelEdit, onSaveEdit, onEditChange }) {
  const activeFlavor = isEditing ? editForm.flavor : entry.flavor;
  const theme = resolveTheme(activeFlavor);

  if (isEditing) {
    return React.createElement(
      "article",
      {
        className: "tea-bubble tea-bubble-editing",
        "data-accent": theme.accent,
      },
      React.createElement(
        "div",
        { className: "bubble-theme-note" },
        React.createElement("span", { className: "bubble-theme-chip" }, normalizeFlavor(activeFlavor) || "Editing"),
        React.createElement("p", null, theme.note)
      ),
      React.createElement(
        "div",
        { className: "edit-grid" },
        React.createElement(
          "label",
          null,
          React.createElement("span", null, "Flavor"),
          React.createElement("input", {
            type: "text",
            name: "flavor",
            value: editForm.flavor,
            onChange: onEditChange,
            required: true,
          })
        ),
        React.createElement(
          "label",
          null,
          React.createElement("span", null, "Location"),
          React.createElement("input", {
            type: "text",
            name: "location",
            value: editForm.location,
            onChange: onEditChange,
            required: true,
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
            required: true,
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
            required: true,
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
          "Save changes"
        )
      )
    );
  }

  return React.createElement(
    "article",
    {
      className: "tea-bubble",
      "data-accent": theme.accent,
    },
    React.createElement(
      "div",
      { className: "bubble-theme-note" },
      React.createElement("span", { className: "bubble-theme-chip" }, entry.flavor),
      React.createElement("p", null, theme.note)
    ),
    React.createElement(
      "div",
      { className: "bubble-topline" },
      React.createElement("span", { className: "bubble-location" }, entry.location),
      React.createElement(StarDisplay, { rating: entry.rating })
    ),
    React.createElement("h3", null, entry.drinkName),
    React.createElement("p", { className: "bubble-thoughts" }, entry.thoughts),
    React.createElement(
      "div",
      { className: "bubble-actions" },
      React.createElement(
        "button",
        { className: "bubble-button bubble-button-ghost", type: "button", onClick: onStartEdit },
        "Edit"
      )
    )
  );
}

function FlavorSection({
  flavor,
  entries,
  editingId,
  editForm,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditChange,
}) {
  const theme = resolveTheme(flavor);

  return React.createElement(
    "section",
    {
      className: "flavor-section",
      "data-accent": theme.accent,
    },
    React.createElement(
      "div",
      { className: "flavor-section-header" },
      React.createElement("p", { className: "flavor-tag" }, `${entries.length} tea${entries.length === 1 ? "" : "s"}`),
      React.createElement(
        "div",
        { className: "section-heading-copy" },
        React.createElement("h2", null, flavor),
        React.createElement("p", null, theme.note)
      )
    ),
    React.createElement(
      "div",
      { className: "bubble-grid" },
      entries.map((entry) =>
        React.createElement(ReviewBubble, {
          key: entry.id,
          entry,
          isEditing: editingId === entry.id,
          editForm,
          onStartEdit: () => onStartEdit(entry),
          onCancelEdit,
          onSaveEdit: () => onSaveEdit(entry.id),
          onEditChange,
        })
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
          setEntries(Array.isArray(parsedEntries) ? parsedEntries : starterEntries);
        } catch {
          setEntries(starterEntries);
        }
      } else {
        setEntries(starterEntries);
      }

      setIsLoading(false);
    }, 1450);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  const grouped = useMemo(() => groupEntries(entries), [entries]);
  const flavorNames = useMemo(() => sortFlavorNames(Object.keys(grouped)), [grouped]);

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
    React.Fragment,
    null,
    React.createElement(
      "div",
      { className: "floating-bubbles", "aria-hidden": true },
      React.createElement("span", { className: "ambient-bubble bubble-a" }),
      React.createElement("span", { className: "ambient-bubble bubble-b" }),
      React.createElement("span", { className: "ambient-bubble bubble-c" }),
      React.createElement("span", { className: "ambient-bubble bubble-d" }),
      React.createElement("span", { className: "ambient-bubble bubble-e" }),
      React.createElement("span", { className: "ambient-bubble bubble-f" })
    ),
    React.createElement(
      "main",
      { className: "page-shell" },
      React.createElement(
        "section",
        { className: "hero-card" },
        React.createElement(
          "div",
          { className: "hero-copy-wrap" },
          React.createElement("p", { className: "eyebrow" }, "Peachy review journal"),
          React.createElement("h1", null, "to tea or not to tea"),
          React.createElement(
            "p",
            { className: "hero-copy" },
            "A bright little home for every iced tea crush, surprise favorite, and politely disappointing sip."
          )
        ),
        React.createElement(
          "div",
          { className: "hero-media" },
          React.createElement("img", {
            className: "hero-image hero-image-main",
            src: "./assets/peach-hero.jpg",
            alt: "Close-up of ripe peaches",
          }),
          React.createElement("img", {
            className: "hero-image hero-image-secondary",
            src: "./assets/peach-orchard.jpg",
            alt: "Crates of peaches in an orchard",
          })
        )
      ),
      React.createElement(
        "section",
        { className: "composer-card" },
        React.createElement(
          "div",
          { className: "composer-heading" },
          React.createElement("h2", null, "Add a fresh tea bubble"),
          React.createElement(
            "p",
            null,
            "Log the flavor, where you found it, the name, your star rating, and your thoughts."
          )
        ),
        React.createElement(
          "form",
          { className: "tea-form", onSubmit: submitEntry },
          React.createElement(
            "label",
            null,
            React.createElement("span", null, "Flavor"),
            React.createElement("input", {
              type: "text",
              name: "flavor",
              placeholder: "Peach, passionfruit, lemon...",
              value: form.flavor,
              onChange: updateField,
              required: true,
            })
          ),
          React.createElement(
            "label",
            null,
            React.createElement("span", null, "Location"),
            React.createElement("input", {
              type: "text",
              name: "location",
              placeholder: "Where did you get it?",
              value: form.location,
              onChange: updateField,
              required: true,
            })
          ),
          React.createElement(
            "label",
            null,
            React.createElement("span", null, "Drink name"),
            React.createElement("input", {
              type: "text",
              name: "drinkName",
              placeholder: "What was it called?",
              value: form.drinkName,
              onChange: updateField,
              required: true,
            })
          ),
          React.createElement(
            "div",
            { className: "rating-picker" },
            React.createElement("span", { className: "rating-label" }, "Overall rating"),
            React.createElement(StarDisplay, {
              rating: form.rating,
              interactive: true,
              onChange: (value) => setForm((current) => ({ ...current, rating: value })),
            }),
            React.createElement("small", null, `${form.rating} out of 5 stars`)
          ),
          React.createElement(
            "label",
            { className: "thoughts-field" },
            React.createElement("span", null, "Thoughts"),
            React.createElement("textarea", {
              name: "thoughts",
              rows: 5,
              placeholder: "How did it taste? Would you order it again?",
              value: form.thoughts,
              onChange: updateField,
              required: true,
            })
          ),
          React.createElement(
            "button",
            { className: "submit-button", type: "submit", disabled: !validateDraft(form) },
            "Add tea to the board"
          )
        )
      ),
      React.createElement(
        "section",
        { className: "board" },
        React.createElement(
          "div",
          { className: "board-header" },
          React.createElement("h2", null, "Flavor bubbles"),
          React.createElement(
            "p",
            null,
            "Each review bubble now carries its own fruit mood, and every entry can be edited right where it lives."
          )
        ),
        flavorNames.length > 0
          ? flavorNames.map((flavor) =>
              React.createElement(FlavorSection, {
                key: flavor,
                flavor,
                entries: grouped[flavor].sort(
                  (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
                ),
                editingId,
                editForm,
                onStartEdit: startEdit,
                onCancelEdit: cancelEdit,
                onSaveEdit: saveEdit,
                onEditChange: updateEditField,
              })
            )
          : React.createElement(
              "div",
              { className: "empty-state" },
              React.createElement("h3", null, "No teas yet"),
              React.createElement("p", null, "Your first sip review will bloom here.")
            )
      )
    )
  );
}

createRoot(document.getElementById("root")).render(React.createElement(App));

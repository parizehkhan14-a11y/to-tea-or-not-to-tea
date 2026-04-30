import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const STORAGE_KEY = "to-tea-or-not-to-tea.entries";
const ADMIN_SESSION_KEY = "to-tea-or-not-to-tea.admin";
const SUPABASE_URL = "https://alwrxbaduximegobhcak.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gt3t5UkG4ZYcvxHUnzjm8g_t0dspVif";
const teaStore = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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
  peach: { accent: "peach", pattern: "peach-pattern" },
  passionfruit: { accent: "passionfruit", pattern: "passionfruit-pattern" },
  lemon: { accent: "lemon", pattern: "lemon-pattern" },
  lychee: { accent: "lychee", pattern: "lychee-pattern" },
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

function rowToEntry(row) {
  return {
    id: row.id,
    flavor: row.flavor,
    location: row.location,
    drinkName: row.drink_name,
    rating: row.rating,
    thoughts: row.thoughts,
    createdAt: row.created_at,
  };
}

function entryToRow(entry) {
  return {
    id: entry.id,
    flavor: entry.flavor,
    location: entry.location,
    drink_name: entry.drinkName,
    rating: entry.rating,
    thoughts: entry.thoughts,
    created_at: entry.createdAt,
  };
}

function readLocalEntries() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsedEntries = JSON.parse(stored);
    return Array.isArray(parsedEntries) ? parsedEntries : [];
  } catch {
    return [];
  }
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

function resolveTheme(flavor) {
  return flavorThemes[formatFlavorKey(flavor)] || { accent: "peach", pattern: "peach-pattern" };
}

function byNewest(a, b) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortEntries(entries, filter) {
  const copy = [...entries];

  if (filter === "highest") {
    return copy.sort((a, b) => b.rating - a.rating || byNewest(a, b));
  }

  if (filter === "lowest") {
    return copy.sort((a, b) => a.rating - b.rating || byNewest(a, b));
  }

  if (filter === "flavor") {
    return copy.sort((a, b) => normalizeFlavor(a.flavor).localeCompare(normalizeFlavor(b.flavor)) || byNewest(a, b));
  }

  if (filter === "location") {
    return copy.sort((a, b) => a.location.localeCompare(b.location) || byNewest(a, b));
  }

  return copy.sort(byNewest);
}

function usePageState() {
  const initial = window.location.hash === "#reviews" ? "reviews" : "home";
  const [page, setPage] = useState(initial);

  useEffect(() => {
    function syncFromHash() {
      setPage(window.location.hash === "#reviews" ? "reviews" : "home");
    }

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function changePage(next) {
    window.location.hash = next === "reviews" ? "reviews" : "";
    setPage(next);
  }

  return [page, changePage];
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
    )
  );
}

function PageNav({ page, onChangePage }) {
  return React.createElement(
    "div",
    { className: "page-nav" },
    React.createElement(
      "button",
      {
        type: "button",
        className: page === "home" ? "page-chip active" : "page-chip",
        onClick: () => onChangePage("home"),
      },
      "Front Page"
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: page === "reviews" ? "page-chip active" : "page-chip",
        onClick: () => onChangePage("reviews"),
      },
      "All Reviews"
    )
  );
}

function ReviewBubble({ entry, isEditing, editForm, onStartEdit, onCancelEdit, onSaveEdit, onDeleteEdit, onEditChange }) {
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
            { className: "bubble-button bubble-button-danger", type: "button", onClick: onDeleteEdit },
            "Delete"
          ),
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

function ReviewsGrid({ entries, editingId, editForm, onStartEdit, onCancelEdit, onSaveEdit, onDeleteEdit, onEditChange }) {
  return React.createElement(
    "div",
    { className: "review-grid" },
    entries.map((entry) =>
      React.createElement(ReviewBubble, {
        key: entry.id,
        entry,
        isEditing: editingId === entry.id,
        editForm,
        onStartEdit: () => onStartEdit(entry),
        onCancelEdit,
        onSaveEdit: () => onSaveEdit(entry.id),
        onDeleteEdit: () => onDeleteEdit(entry.id),
        onEditChange,
      })
    )
  );
}

function AdminLoginModal({ password, error, onPasswordChange, onCancel, onSubmit }) {
  return React.createElement(
    "div",
    { className: "admin-modal-backdrop", role: "presentation" },
    React.createElement(
      "form",
      { className: "admin-modal", onSubmit },
      React.createElement("h2", null, "Admin login"),
      React.createElement("p", null, "Enter the admin password to edit this review."),
      React.createElement("input", {
        type: "password",
        value: password,
        onChange: onPasswordChange,
        placeholder: "Password",
        autoFocus: true,
      }),
      error && React.createElement("p", { className: "admin-error" }, error),
      React.createElement(
        "div",
        { className: "admin-actions" },
        React.createElement("button", { type: "button", className: "bubble-button bubble-button-ghost", onClick: onCancel }, "Cancel"),
        React.createElement("button", { type: "submit", className: "bubble-button" }, "Unlock")
      )
    )
  );
}

function App() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = usePageState();
  const [sortMode, setSortMode] = useState("latest");
  const [activeFlavor, setActiveFlavor] = useState("all");
  const [flavorMenuOpen, setFlavorMenuOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true");
  const [pendingEditEntry, setPendingEditEntry] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadEntries() {
      const fallbackEntries = readLocalEntries();
      const immediateEntries = fallbackEntries.length > 0 ? fallbackEntries : starterEntries;

      setEntries(immediateEntries);
      setIsLoading(false);

      try {
        const { data, error } = await teaStore
          .from("tea_reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!ignore && data.length > 0) {
          setEntries(data.map(rowToEntry));
          return;
        }

        await teaStore.from("tea_reviews").upsert(immediateEntries.map(entryToRow), { onConflict: "id" });

        if (!ignore) {
          setEntries(immediateEntries);
        }
      } catch {
        if (!ignore) {
          setEntries(immediateEntries);
        }
      }
    }

    loadEntries();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const channel = teaStore
      .channel("tea-reviews-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tea_reviews" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setEntries((current) => current.filter((entry) => entry.id !== payload.old.id));
            return;
          }

          const nextEntry = rowToEntry(payload.new);
          setEntries((current) => {
            const withoutChanged = current.filter((entry) => entry.id !== nextEntry.id);
            return [nextEntry, ...withoutChanged].sort(byNewest);
          });
        }
      )
      .subscribe();

    return () => {
      teaStore.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  const featuredEntries = useMemo(() => [...entries].sort(byNewest).slice(0, 3), [entries]);
  const availableFlavors = useMemo(
    () => [...new Set(entries.map((entry) => normalizeFlavor(entry.flavor)))].sort((a, b) => a.localeCompare(b)),
    [entries]
  );
  const filteredEntries = useMemo(
    () => (activeFlavor === "all" ? entries : entries.filter((entry) => normalizeFlavor(entry.flavor) === activeFlavor)),
    [entries, activeFlavor]
  );
  const allSortedEntries = useMemo(() => sortEntries(filteredEntries, sortMode), [filteredEntries, sortMode]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
  }

  async function submitEntry(event) {
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

    setEntries((current) => [nextEntry, ...current].sort(byNewest));
    setForm(emptyForm());
    setFlavorMenuOpen(false);
    setPage("reviews");

    try {
      const { error } = await teaStore.from("tea_reviews").insert(entryToRow(nextEntry));
      if (error) {
        throw error;
      }
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([nextEntry, ...entries].sort(byNewest)));
    }
  }

  function openEdit(entry) {
    setEditingId(entry.id);
    setEditForm(toEntryDraft(entry));
  }

  function startEdit(entry) {
    if (isAdminUnlocked) {
      openEdit(entry);
      return;
    }

    setPendingEditEntry(entry);
    setAdminPassword("");
    setAdminError("");
  }

  function cancelAdminLogin() {
    setPendingEditEntry(null);
    setAdminPassword("");
    setAdminError("");
  }

  function submitAdminLogin(event) {
    event.preventDefault();

    if (adminPassword !== "Princesspeach") {
      setAdminError("Wrong password.");
      return;
    }

    setIsAdminUnlocked(true);
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    if (pendingEditEntry) {
      openEdit(pendingEditEntry);
    }
    cancelAdminLogin();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  function updateEditField(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
  }

  async function saveEdit(entryId) {
    if (!validateDraft(editForm)) {
      return;
    }

    let updatedEntry = null;

    setEntries((current) =>
      current
        .map((entry) => {
          if (entry.id !== entryId) {
            return entry;
          }

          updatedEntry = {
              ...entry,
              flavor: normalizeFlavor(editForm.flavor),
              location: editForm.location.trim(),
              drinkName: editForm.drinkName.trim(),
              rating: Number(editForm.rating),
              thoughts: editForm.thoughts.trim(),
            };

          return updatedEntry;
        })
        .sort(byNewest)
    );

    cancelEdit();

    if (!updatedEntry) {
      return;
    }

    try {
      const { error } = await teaStore.rpc("update_tea_review_admin", {
        review_id: entryId,
        admin_password: "Princesspeach",
        next_flavor: updatedEntry.flavor,
        next_location: updatedEntry.location,
        next_drink_name: updatedEntry.drinkName,
        next_rating: updatedEntry.rating,
        next_thoughts: updatedEntry.thoughts,
      });

      if (error) {
        throw error;
      }
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.map((entry) => (entry.id === entryId ? updatedEntry : entry))));
    }
  }

  async function deleteEdit(entryId) {
    const confirmed = window.confirm("Delete this tea review?");
    if (!confirmed) {
      return;
    }

    const nextEntries = entries.filter((entry) => entry.id !== entryId);
    setEntries(nextEntries);
    cancelEdit();

    try {
      const { error } = await teaStore.rpc("delete_tea_review_admin", {
        review_id: entryId,
        admin_password: "Princesspeach",
      });

      if (error) {
        throw error;
      }
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    }
  }

  if (isLoading) {
    return React.createElement(Loader);
  }

  return React.createElement(
    "main",
    { className: "design-shell" },
    React.createElement(PageNav, {
      page,
      onChangePage: (nextPage) => {
        setFlavorMenuOpen(false);
        setPage(nextPage);
      },
    }),
    pendingEditEntry &&
      React.createElement(AdminLoginModal, {
        password: adminPassword,
        error: adminError,
        onPasswordChange: (event) => setAdminPassword(event.target.value),
        onCancel: cancelAdminLogin,
        onSubmit: submitAdminLogin,
      }),
    page === "home"
      ? React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "section",
            { className: "hero-stage" },
            React.createElement("img", {
              className: "hero-backdrop",
              src: "./assets/backdrop.png",
              alt: "",
              "aria-hidden": true,
            }),
            React.createElement(
              "div",
              { className: "hero-copy" },
              React.createElement("h1", null, "To Tea or", React.createElement("br"), "Not to Tea")
            ),
            React.createElement(
              "section",
              { className: "composer-section" },
              React.createElement(
                "div",
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
                      rows: 4,
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
                )
              )
            )
          ),
          React.createElement(
            "section",
            { className: "flavor-board-section" },
            React.createElement("h2", { className: "board-title" }, "The Flavor Board"),
            React.createElement(ReviewsGrid, {
              entries: featuredEntries,
              editingId,
              editForm,
              onStartEdit: startEdit,
              onCancelEdit: cancelEdit,
              onSaveEdit: saveEdit,
              onDeleteEdit: deleteEdit,
              onEditChange: updateEditField,
            }),
            React.createElement(
              "div",
              { className: "board-footer" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "page-chip active",
                  onClick: () => {
                    setFlavorMenuOpen(false);
                    setPage("reviews");
                  },
                },
                "See All Reviews"
              )
            )
          )
        )
      : React.createElement(
          "section",
          { className: "all-reviews-section" },
          React.createElement(
            "div",
            { className: "reviews-header" },
            React.createElement("h2", { className: "board-title" }, "All Reviews"),
            React.createElement(
              "div",
              { className: "sort-toolbar" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: sortMode === "latest" ? "sort-chip active" : "sort-chip",
                  onClick: () => {
                    setSortMode("latest");
                    setFlavorMenuOpen(false);
                  },
                },
                "Latest"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: sortMode === "highest" ? "sort-chip active" : "sort-chip",
                  onClick: () => {
                    setSortMode("highest");
                    setFlavorMenuOpen(false);
                  },
                },
                "Highest Rated"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: sortMode === "lowest" ? "sort-chip active" : "sort-chip",
                  onClick: () => {
                    setSortMode("lowest");
                    setFlavorMenuOpen(false);
                  },
                },
                "Lowest Rated"
              ),
              React.createElement(
                "div",
                { className: "flavor-filter" },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    className:
                      sortMode === "flavor" || activeFlavor !== "all" || flavorMenuOpen ? "sort-chip active" : "sort-chip",
                    onClick: () => {
                      setSortMode("flavor");
                      setFlavorMenuOpen((current) => !current);
                    },
                  },
                  activeFlavor === "all" ? "Flavor" : `Flavor: ${activeFlavor}`
                ),
                flavorMenuOpen &&
                  React.createElement(
                    "div",
                    { className: "flavor-menu" },
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        className: activeFlavor === "all" ? "sort-chip active" : "sort-chip",
                        onClick: () => {
                          setActiveFlavor("all");
                          setSortMode("flavor");
                          setFlavorMenuOpen(false);
                        },
                      },
                      "All Flavors"
                    ),
                    availableFlavors.map((flavor) =>
                      React.createElement(
                        "button",
                        {
                          key: flavor,
                          type: "button",
                          className: activeFlavor === flavor ? "sort-chip active" : "sort-chip",
                          onClick: () => {
                            setActiveFlavor(flavor);
                            setSortMode("flavor");
                            setFlavorMenuOpen(false);
                          },
                        },
                        flavor
                      )
                    )
                  )
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: sortMode === "location" ? "sort-chip active" : "sort-chip",
                  onClick: () => {
                    setSortMode("location");
                    setFlavorMenuOpen(false);
                  },
                },
                "Location"
              )
            )
          ),
          React.createElement(ReviewsGrid, {
            entries: allSortedEntries,
            editingId,
            editForm,
            onStartEdit: startEdit,
            onCancelEdit: cancelEdit,
            onSaveEdit: saveEdit,
            onDeleteEdit: deleteEdit,
            onEditChange: updateEditField,
          })
        )
  );
}

createRoot(document.getElementById("root")).render(React.createElement(App));

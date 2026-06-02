const STORAGE_KEY = "personal-notes-app";

const notesList = document.querySelector("#notesList");
const noteCount = document.querySelector("#noteCount");
const searchInput = document.querySelector("#searchInput");
const newNoteButton = document.querySelector("#newNoteButton");
const titleInput = document.querySelector("#titleInput");
const bodyInput = document.querySelector("#bodyInput");
const deleteButton = document.querySelector("#deleteButton");
const saveStatus = document.querySelector("#saveStatus");
const updatedAt = document.querySelector("#updatedAt");

let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;
let saveTimer = null;

if (notes.length === 0) {
  const firstNote = createNote("Welcome note", "This is your first note. Edit it, delete it, or create a new one.");
  notes = [firstNote];
  activeNoteId = firstNote.id;
  saveNotes();
}

render();

newNoteButton.addEventListener("click", () => {
  const note = createNote("Untitled note", "");
  notes.unshift(note);
  activeNoteId = note.id;
  searchInput.value = "";
  saveNotes();
  render();
  titleInput.focus();
  titleInput.select();
});

searchInput.addEventListener("input", renderNotesList);

titleInput.addEventListener("input", () => {
  updateActiveNote({ title: titleInput.value });
});

bodyInput.addEventListener("input", () => {
  updateActiveNote({ body: bodyInput.value });
});

deleteButton.addEventListener("click", () => {
  if (notes.length === 1) {
    notes = [createNote("Untitled note", "")];
    activeNoteId = notes[0].id;
  } else {
    notes = notes.filter((note) => note.id !== activeNoteId);
    activeNoteId = notes[0].id;
  }

  saveNotes();
  render();
});

function createNote(title, body) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    body,
    createdAt: now,
    updatedAt: now,
  };
}

function updateActiveNote(changes) {
  const note = getActiveNote();
  if (!note) return;

  Object.assign(note, changes, { updatedAt: new Date().toISOString() });
  saveStatus.textContent = "Saving...";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    saveNotes();
    renderNotesList();
    renderMetadata();
    saveStatus.textContent = "Saved";
  }, 250);
}

function getActiveNote() {
  return notes.find((note) => note.id === activeNoteId);
}

function loadNotes() {
  const savedNotes = localStorage.getItem(STORAGE_KEY);
  if (!savedNotes) return [];

  try {
    const parsedNotes = JSON.parse(savedNotes);
    return Array.isArray(parsedNotes) ? parsedNotes : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  saveStatus.textContent = "Saved";
}

function render() {
  renderNotesList();
  renderEditor();
  renderMetadata();
}

function renderNotesList() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    const title = note.title.toLowerCase();
    const body = note.body.toLowerCase();
    return title.includes(searchTerm) || body.includes(searchTerm);
  });

  noteCount.textContent = `${notes.length} ${notes.length === 1 ? "saved note" : "saved notes"}`;
  notesList.innerHTML = "";

  if (visibleNotes.length === 0) {
    notesList.innerHTML = '<div class="empty-state">No matching notes</div>';
    return;
  }

  visibleNotes.forEach((note) => {
    const button = document.createElement("button");
    button.className = `note-card${note.id === activeNoteId ? " active" : ""}`;
    button.type = "button";

    const title = document.createElement("span");
    title.className = "note-card-title";
    title.textContent = note.title.trim() || "Untitled note";

    const preview = document.createElement("span");
    preview.className = "note-card-preview";
    preview.textContent = note.body.trim() || "Empty note";

    button.append(title, preview);
    button.addEventListener("click", () => {
      activeNoteId = note.id;
      render();
    });

    notesList.append(button);
  });
}

function renderEditor() {
  const note = getActiveNote();
  if (!note) return;

  titleInput.value = note.title;
  bodyInput.value = note.body;
}

function renderMetadata() {
  const note = getActiveNote();
  if (!note) return;

  const date = new Date(note.updatedAt);
  updatedAt.textContent = `Updated ${date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

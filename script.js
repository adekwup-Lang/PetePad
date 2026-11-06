
// ======================================
// PETEPAD - NOTE MANAGEMENT SYSTEM
// ======================================

const newNoteBtn = document.getElementById("newNoteBtn");
const notesList = document.getElementById("notesList");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");

const searchNotes = document.getElementById("searchNotes");
const saveStatus = document.getElementById("saveStatus");
const wordCount = document.getElementById("wordCount");

let notes = JSON.parse(localStorage.getItem("petePadNotes")) || [];
let activeNoteId = null;
let currentView = "all";

// Add missing properties to older notes
notes = notes.map(note => ({
    ...note,
    pinned: note.pinned || false,
    archived: note.archived || false,
    trashed: note.trashed || false,
    updatedAt: note.updatedAt || Date.now()
}));

// ======================================
// SAVE SYSTEM
// ======================================

function saveNotes() {
    localStorage.setItem("petePadNotes", JSON.stringify(notes));
}

// ======================================
// NOTE COUNTS
// ======================================

function updateCounts() {
    document.getElementById("allCount").textContent =
        notes.filter(n => !n.archived && !n.trashed).length;

    document.getElementById("pinnedCount").textContent =
        notes.filter(n => n.pinned && !n.archived && !n.trashed).length;

    document.getElementById("archiveCount").textContent =
        notes.filter(n => n.archived && !n.trashed).length;

    document.getElementById("trashCount").textContent =
        notes.filter(n => n.trashed).length;
}

// ======================================
// DISPLAY NOTES
// ======================================

function displayNotes() {
    notesList.innerHTML = "";

    let filteredNotes = notes.filter(note => {
        if (currentView === "all") {
            return !note.archived && !note.trashed;
        }

        if (currentView === "pinned") {
            return note.pinned && !note.archived && !note.trashed;
        }

        if (currentView === "archive") {
            return note.archived && !note.trashed;
        }

        if (currentView === "trash") {
            return note.trashed;
        }
    });

    const search = searchNotes.value.toLowerCase();

    filteredNotes = filteredNotes.filter(note =>
        (note.title + " " + note.content)
        .toLowerCase()
        .includes(search)
    );

    filteredNotes.sort((a, b) => {
        if (a.pinned !== b.pinned && currentView === "all") {
            return Number(b.pinned) - Number(a.pinned);
        }

        return b.updatedAt - a.updatedAt;
    });

    if (filteredNotes.length === 0) {
        notesList.textContent = "No notes found.";
    }

    filteredNotes.forEach(note => {
        const noteItem = document.createElement("div");

        noteItem.className = "note-item";

        if (note.id === activeNoteId) {
            noteItem.classList.add("active");
        }

        const title = document.createElement("span");

        title.textContent =
            (note.pinned ? "📌 " : "") +
            (note.title || "Untitled Note");

        noteItem.appendChild(title);

        noteItem.addEventListener("click", () => {
            openNote(note.id);
        });

        notesList.appendChild(noteItem);
    });

    updateCounts();
}

// ======================================
// CREATE NOTE
// ======================================

function createNote() {
    const note = {
        id: Date.now(),
        title: "",
        content: "",
        pinned: false,
        archived: false,
        trashed: false,
        updatedAt: Date.now()
    };

    notes.unshift(note);

    currentView = "all";
    searchNotes.value = "";

    activeNoteId = note.id;

    noteTitle.value = "";
    noteContent.innerHTML = "";

    saveNotes();
    displayNotes();
    updateWordCount();

    noteTitle.focus();
    saveStatus.textContent = "New note created";
}

// ======================================
// OPEN NOTE
// ======================================

function openNote(id) {
    const note = notes.find(n => n.id === id);

    if (!note) return;

    activeNoteId = id;

    noteTitle.value = note.title;
    noteContent.innerHTML = note.content;

    const isTrashed = note.trashed;

    noteTitle.disabled = isTrashed;
    noteContent.disabled = isTrashed;

    saveStatus.textContent = isTrashed
        ? "In Recently Deleted"
        : "Editing note";

    updateWordCount();
    displayNotes();
}

// ======================================
// UPDATE NOTE
// ======================================

function updateNote() {
    if (activeNoteId === null) return;

    const note = notes.find(n => n.id === activeNoteId);

    if (!note || note.trashed) return;

    note.title = noteTitle.value;
    note.content = noteContent.innerHTML
    note.updatedAt = Date.now();

    saveNotes();
    displayNotes();

    saveStatus.textContent = "All changes saved";
    updateWordCount();
}

// ======================================
// CLEAR EDITOR
// ======================================

function clearEditor() {
    noteTitle.value = "";
    noteContent.innerHTML = "";

    noteTitle.disabled = false;
    noteContent.disabled = false;

    updateWordCount();
}

// ======================================
// WORD COUNTER
// ======================================

function updateWordCount() {
    const words = noteContent.innerText.trim()
       ? noteContent.innerText.trim().split(/\s+/).length
       : 0;

    wordCount.textContent = words + " words";
}

// ======================================
// SIDEBAR NAVIGATION
// ======================================

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        currentView = button.dataset.view;

        activeNoteId = null;
        clearEditor();

        saveStatus.textContent = "Ready";

        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        displayNotes();
    });
});

// ======================================
// EVENT LISTENERS
// ======================================

newNoteBtn.addEventListener("click", createNote);

noteTitle.addEventListener("input", updateNote);
noteContent.addEventListener("input", updateNote);

searchNotes.addEventListener("input", displayNotes);

noteContent.addEventListener("input", updateWordCount);

// ======================================
// INITIALIZE
// ======================================

displayNotes();

if (notes.length > 0) {
    const firstNote = notes.find(n => !n.trashed);

    if (firstNote) {
        currentView = firstNote.archived ? "archive" : "all";

        document.querySelectorAll(".nav-item").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.view === currentView
            );
        });

        openNote(firstNote.id);
    } else {
        clearEditor();
    }
} else {
    clearEditor();
}

// ======================================
// THEME SYSTEM
// ======================================

const themeBtn = document.getElementById("themeBtn");

let currentTheme =
    localStorage.getItem("petePadTheme") || "dark";

function applyTheme() {
    document.body.classList.toggle(
        "light-mode",
        currentTheme === "light"
    );

    themeBtn.textContent =
        currentTheme === "dark" ? "☀️" : "🌙";

    localStorage.setItem("petePadTheme", currentTheme);
}

themeBtn.addEventListener("click", () => {
    currentTheme =
        currentTheme === "dark" ? "light" : "dark";

    applyTheme();
});

applyTheme();
// PETEPAD TEXT FORMATTING
const formatButtons = document.querySelectorAll(".format-toolbar button");

formatButtons.forEach(button => {
    button.addEventListener("click", () => {
        const command = button.dataset.command;
        const value = button.dataset.value || null;

        noteContent.focus();

        document.execCommand(command, false, value);

        updateNote();
        updateWordCount();
    });
});
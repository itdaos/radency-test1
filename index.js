'use strict';

// Utility

function parseDates(content) {
    // Uses regex to parse all dates from content
    const re = /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4})+/g; // 02/02/2002
    return String(content).match(re) || []; // returns an array of strings that present in specified format 
}

function tmstmpToString(timestamp) {
    // Returns a string representing timestamp in default format
    const date = new Date(timestamp);
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}

function getImgName(category) {
    switch (category) {
        case "task":
            return "favorite.svg";
        case "random":
            return "geo.svg";
        case "idea":
            return "sun.svg";
        default:
            return ""
    };
}

function getCategoryName(category) {
    switch (category) {
        case "task":
            return "Task";
        case "random":
            return "Random Thought";
        case "idea":
            return "Idea";
        default:
            return "";
    };
}

function formDataToMap(formData) {
    let arr = Array.from(formData);
    return arr.reduce(
        (prev, current) => {
            prev[current[0]] = current[1];
            return prev;
        }, {}
    );
}
// Events

const addNote = (note, container) => {
        let collection = container === "archive" ? archive : notes;

        note = note || dummyNote;
        note.id = collection.length
        note.createdAt = note.createdAt || tmstmpToString(Date.now());
        note.dates = note.dates || parseDates(note.content);

        // console.log("Adding Note", note);
        const elem = document.createElement('div');
        elem.className = "row item";
        elem.innerHTML = `
        <div class="col-2 name">
            <img src="img/${getImgName(note.category)}" alt="">
            <p>${note.name}</p>
        </div>
        <div class="col-1">${note.createdAt}</div>
        <div class="col-2 category">${
            getCategoryName( note.category )
        }</div>
        <div class="col-4 content">${note.content}</div>
        <div class="col-1">${
            note.dates.reduce(
                (prev, cur) => {
                    return prev + "<br>" + cur
                }, ""
            )
        }</div>
        <div class="col-2 controls">
            ${ container === "archive" ? "" : `<img src="img/edit.svg" alt="edit" onClick="createEditForm(${note.id})">`  }
            <img src="img/doc.svg" alt="archive" onClick="toggleArchived(${note.id}, ${ container !== "archive" })">
            ${ 
                container === "archive" ? 
                `<img src="img/delete.svg" alt="delete" onClick="deleteNoteById(${note.id}, 'archive')">` : 
                `<img src="img/delete.svg" alt="delete" onClick="deleteNoteById(${note.id})">`
            }
        </div>
    `;
    let holder = container === "archive" ? archiveHolder : tableHolder;
    holder.appendChild(elem);
    collection.push({...note });
}

const createEditForm = (id) => {
    // 1. create form with note data 
    // 2. replace note div with form
    let idx = -1;
    for (let i = 0; i < notes.length; i++) {
        if (id === notes[i].id) {
            idx = i;
            break;
        }
    }

    if (idx === -1) return;
    let note = notes[id];

    console.log(`Note with id = ${id} is being edited.`);
    const domNote = document.querySelector(`#table-container .row:nth-child(${3 + idx})`);
    let form = document.createElement("form");
    form.id = "edit" + idx;
    form.className = "row item";

    form.innerHTML = `
    <div class="col-2 name">
        <input type="text" name="name" id="form-name" value="${note.name}">
    </div>
    <div class="col-1">${note.createdAt}</div>
    <div class="col-2 category">
        <select name="category" id="form-category" >
            <option value="" ${ note.category == "" ? "selected" : "" }></option> 
            <option value="random" ${ note.category == "random" ? "selected" : "" }>Random Thought</option>
            <option value="idea"   ${ note.category == "idea" ? "selected" : "" }>Idea</option>
            <option value="task"   ${ note.category == "task" ? "selected" : "" }>Task</option>
        </select>
    </div>
    <div class="col-4 content">
        <textarea name="content" id="form-content" cols="30" rows="10">${note.content.trim()}</textarea>  
    </div>
    <div class="col-1">${
        note.dates.reduce(
            (prev, cur) => {
                return prev + "<br>" + cur
            }, ""
        )
    }</div>
    <div class="col-2 controls">
        <input type="button" id="form-submit" onClick="editNote(${idx})">
    </div>
    `;
    domNote.replaceWith(form);
}

const editNote = (idx) => {
    // 1) find editable form with this index
    // 2) replace form with data from this form

    const form = document.querySelector(`#edit${idx}`);
    const note = formDataToMap(new FormData(form));
    const prev = notes[idx];
    note.dates = prev.dates;
    note.createdAt = prev.createdAt;
    note.id = prev.id;
    console.log(note);

    const domNote = document.createElement("div");
    domNote.className = "row item";
    domNote.innerHTML = `
    <div class="col-2 name">
        <img src="img/${getImgName(note.category)}" alt="">
        <p>${note.name}</p>
    </div>
    <div class="col-1">${note.createdAt}</div>
    <div class="col-2 category">${
        getCategoryName( note.category )
    }</div>
    <div class="col-4 content">${note.content}</div>
    <div class="col-1">${
        note.dates.reduce(
            (prev, cur) => {
                return prev + "<br>" + cur
            }, ""
        )
    }</div>
    <div class="col-2 controls">
        <img src="img/edit.svg" alt="edit" onClick="createEditForm(${note.id})">
        <img src="img/doc.svg" alt="archive" onClick="archiveNoteById(${note.id})">
        <img src="img/delete.svg" alt="delete" onClick="deleteNoteById(${note.id})">
    </div>
    `;
    form.replaceWith(domNote);
    notes[idx] = {...note };

}

const archiveNoteById = (id) => {
    const copy = deleteNoteById(id);
    addNote(copy, "archive");
    console.log("Archive now: ", archive);
    
}

const unarchiveNoteById = (id) => {
    const copy = deleteNoteById(id, "archive");
    addNote(copy);
    console.log("Archive now: ", archive);  
}

const toggleArchived = (id, isActive) => {
    const containerFrom = isActive ? "main" : "archive";
    const containerTo = isActive ? "archive" : "main";
    
    const copy = deleteNoteById(id, containerFrom);
    addNote(copy, containerTo);
    console.log("Archive now: ", archive); 
}

const deleteNoteById = (id, container) => {
    let collection = container === "archive" ? archive : notes;

    let idx = -1;
    for (let i = 0; i < collection.length; i++) {
        if (id === collection[i].id) {
            idx = i;
            break;
        }
    }

    if (idx === -1) return;

    let domId = "#table-container";
    if (container === "archive") domId = "#archive-container";

    // delete visually
    const domNote = document.querySelector(`${domId} .row:nth-child(${3 + idx})`);
    console.log(`Note with id = ${id} was successfully deleted.`);
    domNote.remove();

    // delete in storage
    let copy = {...collection[idx] };
    collection.splice(idx, 1);
    return copy
}

const createNote = () => {
    const form = document.getElementById("new-note");
    const formMap = formDataToMap(new FormData(form));

    form.remove();
    addNote(formMap);
    document.getElementById("add-btn").hidden = false;
}

const createForm = () => {
    const elem = document.createElement('form');
    elem.id = "new-note";
    elem.className = "row item";
    elem.innerHTML = `
        <div class="col-3">
            <label for="name">Name:</label>
            <input type="text" name="name" id="form-name">
        </div>
        <div class="col-6">
            <label for="content">Content:</label>
            <textarea name="content" id="form-content" cols="30" rows="10"></textarea>
        </div>
        <div class="col-2">
            <select name="category" id="form-category">
                <option value="" selected></option> 
                <option value="random">Random Thought</option>
                <option value="idea">Idea</option>
                <option value="task">Task</option>
            </select>
        </div>
        <div class="col-1">
            <input type="button" id="form-submit" onClick="createNote()">
        </div>
    `;
    tableHolder.appendChild(elem);
    document.getElementById("add-btn").hidden = true;
}

// UI
const btnAddNew = document.getElementById("add-btn").addEventListener("click", createForm);

const tableHolder = document.getElementById("table-container");
const archiveHolder = document.getElementById("archive-container");
const summaryHolder = document.getElementById("summary-container");

// Data

let notes = [];
let archive = []

// Init
startingNotes.forEach(elem => {
    addNote(elem);
});
startingArchive.forEach(elem => {
    addNote(elem, "archive");
})
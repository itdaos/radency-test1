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
            return ""
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

const addNote = (note) => {
    note = note || dummyNote;
    if (note.id === undefined || note.id === null) note.id = notes.length
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
            <img src="img/edit.svg" alt="edit" onClick="createEditForm(${note.id})">
            <img src="img/doc.svg" alt="archive" onClick="archiveNoteById(${note.id})">
            <img src="img/delete.svg" alt="delete" onClick="deleteNoteById(${note.id})">
        </div>
    `;
    tableHolder.appendChild(elem);
    notes.push({...note });
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
    archive.push(copy);
    console.log("Archive now: ", archive);
}

const deleteNoteById = (id) => {
    let idx = -1;
    for (let i = 0; i < notes.length; i++) {
        if (id === notes[i].id) {
            idx = i;
            break;
        }
    }

    if (idx === -1) return;

    // delete visually
    const domNote = document.querySelector(`#table-container .row:nth-child(${3 + idx})`);
    console.log(`Note with id = ${id} was successfully deleted.`);
    domNote.remove();

    // delete in storage
    let copy = {...notes[idx] };
    notes.splice(idx, 1);
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

// Data

let startingNotes = [{
        "id": 0,
        "name": "ullamco dolore",
        "createdAt": "05/09/2014",
        "category": "task",
        "content": "Aute tempor labore deserunt labore ad. Fugiat irure velit ullamco nostrud nostrud. Fugiat Lorem ex qui elit commodo irure consectetur ea. Aliqua deserunt tempor et consequat dolor veniam enim et minim. Exercitation excepteur est duis incididunt consectetur. Nostrud fugiat nisi ipsum ea officia ullamco elit labore ad sit anim non. Sit dolor cillum ipsum nostrud cupidatat pariatur elit voluptate.\r\n",
        "dates": ["28/02/2014"]
    },
    {
        "id": 1,
        "name": "sunt anim",
        "createdAt": "22/12/2015",
        "category": "random",
        "content": "Id velit amet deserunt est sit amet reprehenderit commodo ullamco ullamco Lorem velit aute quis. Aliqua nulla irure et laborum dolore eu culpa pariatur nulla ut pariatur ipsum et aliquip. Sit non minim culpa est. Commodo ad qui nulla eiusmod laborum.\r\n",
        "dates": ["09/12/2017"]
    },
    {
        "id": 2,
        "name": "mollit eiusmod",
        "createdAt": "11/09/2017",
        "category": "random",
        "content": "Fugiat elit consequat elit enim aliqua ex adipisicing consectetur exercitation ad sunt exercitation. Ea magna commodo eu reprehenderit eu magna officia. Laborum mollit consequat dolor mollit duis. Quis laboris cillum dolor eiusmod sint dolore ea qui incididunt tempor.\r\n",
        "dates": ["14/02/2018"]
    },
    {
        "id": 3,
        "name": "irure laboris",
        "createdAt": "21/09/2018",
        "category": "random",
        "content": "Id aliqua aliquip culpa eiusmod excepteur. Sunt officia exercitation consectetur ex. Cupidatat duis sunt labore quis dolor adipisicing esse qui commodo ex aliqua cupidatat est. Dolore culpa irure tempor id minim ex veniam. Culpa aute aliquip fugiat enim duis.\r\n",
        "dates": ["28/02/2016"]
    },
    {
        "id": 4,
        "name": "eu veniam",
        "createdAt": "28/06/2019",
        "category": "random",
        "content": "Ad consequat dolore elit nulla laborum et. Occaecat aliqua eiusmod veniam excepteur do id deserunt duis officia. Quis commodo qui proident anim magna laboris adipisicing occaecat eu laborum laborum labore dolor eiusmod. Ullamco eu eiusmod ea mollit sunt et commodo do sunt aute ipsum tempor. Cillum non velit eiusmod elit incididunt consectetur do id dolore ad. Ad pariatur incididunt est elit esse. Minim veniam in consequat enim nostrud laborum laboris esse.\r\n",
        "dates": ["22/11/2018"]
    },
    {
        "id": 5,
        "name": "anim exercitation",
        "createdAt": "14/12/2020",
        "category": "idea",
        "content": "Ad reprehenderit esse commodo nostrud veniam elit nisi labore magna ad sint. Est proident aliqua reprehenderit cillum nulla nulla. Est fugiat reprehenderit tempor aliqua nostrud.\r\n",
        "dates": ["10/02/2017"]
    }
];

let notes = [];
let archive = []

startingNotes.forEach(elem => {
    addNote(elem);
});
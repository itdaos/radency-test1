'use strict';

// Utility

function parseDates(content) {
    // Uses regex to parse all dates from content
    const re = /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4})+/g; // 02/02/2002
    return String(content).match(re) || []; // returns an array of strings that present in specified format 
}

// Events
const addNote = () => {
    console.log("Adding Note");
    const note = dummyNote;
    const elem = document.createElement('div');
    elem.className = "row item";
    elem.innerHTML = `
        <div class="col-1"></div>
        <div class="col-2">${note.name}</div>
        <div class="col-2">${note.createdAt}</div>
        <div class="col-2">${note.category}</div>
        <div class="col-2">${note.content}</div>
        <div class="col-2">${note.dates}</div>
        <div class="col-1"></div>
    `;
    tableHolder.appendChild(elem);
}

// UI
const btnAddNew = document.getElementById("add-btn").addEventListener("click", addNote);

const tableHolder = document.getElementById("table-container");

// Data
const dummyNote = {
    id: 0,
    name: "Shopping list",
    createdAt: Date.now(),
    category: "Task",
    content: "Tomatoes, Bread, Cookies, Milk",
    dates: "05/05/2021",
};

let notes = [dummyNote];


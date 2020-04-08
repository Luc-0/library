const bookList = document.getElementById("book-list");
const form = document.getElementById("book-form");

myStorage = window.localStorage;
console.log();

let library = loadLocalStorageLibrary();

render();

form.addEventListener("submit", addBookToLibrary);

function loadLocalStorageLibrary() {
    let localLibrary = JSON.parse(localStorage.getItem("library"));
    
    if (localLibrary == null) {
        return new Array();
    }
    return localLibrary;
}

function updateLibraryLocalStorage() {
    localStorage.setItem("library", JSON.stringify(library));
}

function Book(title, author, pages, status) {
    this.title = title,
    this.author = author,
    this.pages = pages,
    this.status = status;
}

function render() {
    library.forEach(book => {
        displayBook(book);
    });
}

function addBookToLibrary(e) {
    e.preventDefault();
    let inputs = e.target.elements;

    let title = inputs[0].value.trim();
    let author = inputs[1].value.trim();
    let pages = inputs[2].value.trim();
    let status = inputs[3].checked;

    let newBook = new Book(title, author, pages, status);
    
    library.push(newBook);
    updateLibraryLocalStorage();
    displayBook(newBook);
}

function displayBook(book) {    
    let bookItem = document.createElement("li");
    bookItem.className = "book-item";
    
    // Get array of book values
    let bookValues = Object.values(book);
    
    // Put each book value into a span element
    let length = bookValues.length - 1;
    let spanArr = createSpanArr(bookValues, length);

    // Add span to li
    spanArr.forEach(span => {
        bookItem.appendChild(span);
    });

    // Create read checkbox
    let readStatus = bookValues[3];
    let readCheck = createCheckbox(readStatus);
    readCheck.addEventListener('click', changeReadStatus);

    let checkSpan = document.createElement('span');
    checkSpan.appendChild(readCheck);
    bookItem.appendChild(checkSpan);

    let removeButton = document.createElement('button');
    removeButton.className = "remove-btn";
    removeButton.innerText = "X";
    removeButton.addEventListener('click', removeFromList);

    bookItem.appendChild(removeButton);
    bookList.appendChild(bookItem);
}

function removeFromList(e) {
    let book = e.target.parentElement;
    let bookListArr = Array.from(bookList.children);
    let index = bookListArr.indexOf(book);

    library.splice(index, 1);
    updateLibraryLocalStorage();
    bookList.removeChild(book);
}

function changeReadStatus(e) {
    let book = e.target.parentElement.parentElement;
    let bookListArr = Array.from(bookList.children);
    let index = bookListArr.indexOf(book);

    let status = library[index].status;
    if (status) {
        library[index].status = false;
    } else {
        library[index].status = true;
    }
    updateLibraryLocalStorage();
}

// Put each value into a span element
function createSpanArr(arr, length) {
    let spanArr = [];
    for (let i = 0; i < length; i++) {
        let span = document.createElement('span');
        span.textContent = arr[i];
        spanArr.push(span);
    }
    return spanArr;
}

function createCheckbox(checked) {
    if (!(typeof checked === "boolean")){
        return -1;
    }

    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";

    if (checked) {
        checkbox.checked = true;
    }
    return checkbox;
}

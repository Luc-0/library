let myLibrary = [];

function Book(title, author, pages, readed) {
    this.title = title,
    this.author = author,
    this.pages = pages,
    this.readed = readed;
}

function addBookToLibrary(book) {
    if (!(book instanceof Book)) {
        return -1;
    }
    
    myLibrary.push(book);
}

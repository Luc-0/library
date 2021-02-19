const bookList = document.getElementById('book-list');
const form = document.getElementById('book-form');
const newButton = document.getElementById('new-btn');
const userPicElement = document.getElementById('user-pic');
const userNameElement = document.getElementById('user-name');
const signInButtonElement = document.getElementById('sign-in');
const signOutButtonElement = document.getElementById('sign-out');
const mustSignInMessageElement = document.getElementById('must-signin-message');

signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);
newButton.addEventListener('click', showForm);
form.addEventListener('submit', addBookToLibrary);

const db = firebase.firestore();
initFirebaseAuth();

let books = [];

class Book {
    constructor(title, author, pages, status) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.status = status;
    }
}

function signIn() {
    // Sign into firebase using popup auth & Google as the indenty provider.
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

function signOut() {
    firebase.auth().signOut();
}

function initFirebaseAuth() {
    firebase.auth().onAuthStateChanged(authStateObserver);
}

function getProfilePicUrl() {
    return (
        firebase.auth().currentUser.photoURL ||
        './images/profile_placeholder.png'
    );
}

function getUserName() {
    return firebase.auth().currentUser.displayName;
}

function isUserSignedIn() {
    return !!firebase.auth().currentUser;
}

function authStateObserver(user) {
    if (user) {
        // User is signed in!
        // Get the signed-in user's profile pic and name.
        var profilePicUrl = getProfilePicUrl();
        var userName = getUserName();

        // Set the user's profile pic and name.
        userPicElement.style.backgroundImage =
            'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
        userNameElement.textContent = userName;

        // Show user's profile and sign-out button.
        userNameElement.removeAttribute('hidden');
        userPicElement.removeAttribute('hidden');
        signOutButtonElement.removeAttribute('hidden');

        // Hide sign-in button.
        signInButtonElement.setAttribute('hidden', 'true');

        loadDatabaseUserBooks();
    } else {
        // User is signed out!
        // Hide user's profile and sign-out button.
        userNameElement.setAttribute('hidden', 'true');
        userPicElement.setAttribute('hidden', 'true');
        signOutButtonElement.setAttribute('hidden', 'true');

        // Show sign-in button.
        signInButtonElement.removeAttribute('hidden');
        clearForm();
        hideForm();
        clearBookList();
    }
}

function checkSignInWithMessage() {
    if (isUserSignedIn()) {
        return true;
    }

    mustSignInMessageElement.removeAttribute('hidden');

    setTimeout(() => {
        mustSignInMessageElement.setAttribute('hidden', 'true');
    }, 3000);
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
    if (
        url.indexOf('googleusercontent.com') !== -1 &&
        url.indexOf('?') === -1
    ) {
        return url + '?sz=150';
    }
    return url;
}

function loadDatabaseUserBooks() {
    const currentUserId = firebase.auth().currentUser.uid;
    const userDoc = db.collection('users').doc(currentUserId);
    userDoc.get().then((doc) => {
        if (!doc.exists) {
            console.log('not ex');
            return [];
        }

        books = JSON.parse(doc.data().books);
        render();
    });
}

//
function updateDatabaseUserBooks() {
    if (!isUserSignedIn) {
        console.log('User not logged in to update database');
        return;
    }
    const currentUserId = firebase.auth().currentUser.uid;
    console.log(currentUserId);
    const userDoc = db
        .collection('users')
        .doc(currentUserId)
        .set({ books: JSON.stringify(books) }, { merge: true })
        .then(() => {
            console.log('Document successfully writen.');
        })
        .catch((error) => {
            console.error('Error writing document', error);
        });
}

// function Book(title, author, pages, status) {
//     this.title = title,
//     this.author = author,
//     this.pages = pages,
//     this.status = status;
// }

function clearBookList() {
    bookList.innerHTML = '';
}

function render() {
    books.forEach((book) => {
        displayBook(book);
    });
}

function showForm() {
    if (!checkSignInWithMessage()) {
        return;
    }
    newButton.style.display = 'none';
    form.style.display = 'flex';
}

function hideForm() {
    newButton.style.display = 'inline-block';
    form.style.display = 'none';
}

function clearForm() {
    let length = form.elements.length;
    for (let i = 0; i < length; i++) {
        let element = form.elements[i];
        if (element.type === 'checkbox') {
            form.elements[i].checked = false;
            console.log(form.elements[i].checked);
        } else {
            form.elements[i].value = '';
        }
    }
}

function addBookToLibrary(e) {
    e.preventDefault();
    let inputs = e.target.elements;

    let title = inputs[0].value.trim();
    let author = inputs[1].value.trim();
    let pages = inputs[2].value.trim();
    let status = inputs[3].checked;

    let newBook = new Book(title, author, pages, status);

    books.push(newBook);
    updateDatabaseUserBooks();
    displayBook(newBook);
    clearForm();
    hideForm();
}

function displayBook(book) {
    let bookItem = document.createElement('li');
    bookItem.className = 'book-item';

    // Get array of book values
    let bookValues = Object.values(book);

    // Put each book value into a span element
    let length = bookValues.length - 1;
    let spanArr = createSpanArr(bookValues, length);

    // Add span to li
    spanArr.forEach((span) => {
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
    removeButton.className = 'remove-btn';
    removeButton.innerText = 'X';
    removeButton.addEventListener('click', removeFromList);

    bookItem.appendChild(removeButton);
    bookList.appendChild(bookItem);
}

function removeFromList(e) {
    let book = e.target.parentElement;
    let bookListArr = Array.from(bookList.children);
    let index = bookListArr.indexOf(book);

    books.splice(index, 1);
    updateDatabaseUserBooks();
    bookList.removeChild(book);
}

function changeReadStatus(e) {
    let book = e.target.parentElement.parentElement;
    let bookListArr = Array.from(bookList.children);
    let index = bookListArr.indexOf(book);

    let status = books[index].status;
    if (status) {
        books[index].status = false;
    } else {
        books[index].status = true;
    }
    updateDatabaseUserBooks();
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
    if (!(typeof checked === 'boolean')) {
        return -1;
    }

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    if (checked) {
        checkbox.checked = true;
    }
    return checkbox;
}

// declare values
let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true});
};


request.onsuccess = function(event) {
    db = event.target.result;

    // checks if app's online
    if(navigator.onLine){
        checkDatabase();
    }
}

// if there's an error, throw an error
request.onerror = function(event) {
    console.log('Oh no!' + event.target.errorCode);
}

function saveRecord(record){
    const transaction = db.transaction(['pending'], 'readwrite');

    // object store access
    const store = transaction.objectStore('pending');

    // add record to the store
    store.add(record);

}

function checkDatabase() {
    // open transaction of pending db
    const transaction = db.transaction(['pending'], 'readwrite');

    // access pending object store
    const store = transaction.objectStore('pending');

    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                header: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['pending'], 'readwrite');
                const store = transaction.objectStore('pending');

                // clear items
                store.clear();
            })
        }
    };
}

// event listener for when app goes online
window.addEventListener("online", checkDatabase);

mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost/deep-thoughts',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  );
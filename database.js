import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, push, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyArkYC2dn5gMwdBqLAjOwgNMfgog8y9xKA",
    authDomain: "atts-schedule-data.firebaseapp.com",
    databaseURL: "https://atts-schedule-data-default-rtdb.firebaseio.com",
    projectId: "atts-schedule-data",
    storageBucket: "atts-schedule-data.appspot.com",
    messagingSenderId: "492046364843",
    appId: "1:492046364843:web:f9500151f845437a0e87ee"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const database = getDatabase(app);
let secret = null;

secret = (token, onResult) => {
    secret = null;
    signInWithEmailAndPassword(auth, "theadmin@admin.the", token).then(()=>{
        setData("/secret", "Ura!", ()=>onResult(true), ()=>onResult(false));
    }).catch(()=>onResult(false))
}

function getData(path, onSuccess, onFailed = null){
    get(ref(database, path)).then((snapshot) => {
        if (snapshot.exists())
            onSuccess(snapshot.val());
        else
            onFailed(false);
    }).catch(() => {
        if (onFailed !== null)
            onFailed(true);
    });
}
function setData(path, data, onSuccess, onFailed = null){
    set(ref(database, path), data).then(() => {
        if (onSuccess !== null)
            onSuccess();
    }).catch(() => {
        if (onFailed !== null)
            onFailed();
    });
}
export {
    getData,
    setData,
    secret
}
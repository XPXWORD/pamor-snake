import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let pyodide = null;

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAjolUG7t60DCrcLYFOGcsPqAvAaqL0fr0",
    authDomain: "raspberrypi-81981.firebaseapp.com",
    projectId: "raspberrypi-81981",
    storageBucket: "raspberrypi-81981.appspot.com",
    messagingSenderId: "652303723165",
    appId: "1:652303723165:web:16145cdca677a703108274"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charger Pyodide
async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
    console.log("Pyodide loaded");
}

loadPyodideAndPackages();

// Sauvegarder le code dans le cloud
async function saveCodeToCloud(code) {
    const recoveryKey = document.getElementById('recovery-key').value;
    console.log("Saving code with recovery key:", recoveryKey);

    try {
        const keyDoc = doc(db, "code-saves", recoveryKey);
        const keyExists = await getDoc(keyDoc);

        if (keyExists.exists()) {
            await updateDoc(keyDoc, {
                code: code,
                timestamp: serverTimestamp()
            });
            console.log("Code updated in cloud");
        } else {
            await setDoc(keyDoc, {
                code: code,
                timestamp: serverTimestamp()
            });
            console.log("Code saved to cloud");
        }
        alert('Code sauvegardé dans le cloud!');
    } catch (error) {
        console.error('Error saving code:', error);
        alert('Erreur lors de la sauvegarde : ' + error.message);
    }
}

// Charger le code depuis le cloud
async function loadCodeFromCloud() {
    const recoveryKey = document.getElementById('recovery-key').value;
    console.log("Loading code with recovery key:", recoveryKey);
    
    try {
        const docRef = doc(db, "code-saves", recoveryKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            document.getElementById('code-editor').value = docSnap.data().code;
            alert('Code chargé depuis le cloud!');
            console.log("Code loaded:", docSnap.data().code);
        } else {
            document.getElementById('key-error').textContent = 'Clé de récupération invalide.';
        }
    } catch (error) {
        console.error('Error loading code:', error);
        document.getElementById('key-error').textContent = 'Erreur lors du chargement : ' + error.message;
    }
}

// Exécuter le code sélectionné
document.getElementById('run-selected-code').addEventListener('click', async () => {
    const code = document.getElementById('code-editor').value;
    console.log("Executing code:", code);
    
    try {
        const output = await pyodide.runPythonAsync(code);
        document.getElementById('output-area').textContent = output;
        console.log("Code executed successfully");
    } catch (err) {
        document.getElementById('output-area').textContent = `Error: ${err}`;
        console.error('Error executing code:', err);
    }
});

// Sauvegarder le code
document.getElementById('save-code').addEventListener('click', () => {
    const code = document.getElementById('code-editor').value;
    console.log("Code to save:", code);
    saveCodeToCloud(code);
});

// Charger le code depuis Firebase
document.getElementById('load-code').addEventListener('click', loadCodeFromCloud);

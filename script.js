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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Charger Pyodide
async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
}

loadPyodideAndPackages();

// Sauvegarder le code dans le cloud
async function saveCodeToCloud(code) {
    const recoveryKey = document.getElementById('recovery-key').value;
    const keyExists = await db.collection("code-saves").doc(recoveryKey).get();

    if (keyExists.exists) {
        await db.collection("code-saves").doc(recoveryKey).update({
            code: code,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } else {
        await db.collection("code-saves").doc(recoveryKey).set({
            code: code,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    alert('Code sauvegardé dans le cloud!');
}

// Charger le code depuis le cloud
async function loadCodeFromCloud() {
    const recoveryKey = document.getElementById('recovery-key').value;
    const doc = await db.collection("code-saves").doc(recoveryKey).get();

    if (doc.exists) {
        document.getElementById('code-editor').value = doc.data().code;
        alert('Code chargé depuis le cloud!');
    } else {
        document.getElementById('key-error').textContent = 'Clé de récupération invalide.';
    }
}

// Exécuter le code sélectionné
document.getElementById('run-selected-code').addEventListener('click', async () => {
    const code = document.getElementById('code-editor').value;
    try {
        const output = await pyodide.runPythonAsync(code);
        document.getElementById('output-area').textContent = output;
    } catch (err) {
        document.getElementById('output-area').textContent = `Error: ${err}`;
    }
});

// Sauvegarder le code
document.getElementById('save-code').addEventListener('click', () => {
    const code = document.getElementById('code-editor').value;
    saveCodeToCloud(code);  // Sauvegarde sur Firebase
});

// Charger le code depuis Firebase
document.getElementById('load-code').addEventListener('click', loadCodeFromCloud);

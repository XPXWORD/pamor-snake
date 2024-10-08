let pyodide = null;

// Firebase configuration (remplace avec tes propres clés)
const firebaseConfig = {
    apiKey: "AIzaSyAjolUG7t60DCrcLYFOGcsPqAvAaqL0fr0",
    authDomain: "raspberrypi-81981.firebaseapp.com",
    projectId: "raspberrypi-81981",
    storageBucket: "raspberrypi-81981.appspot.com",
    messagingSenderId: "652303723165",
    appId: "1:652303723165:web:16145cdca677a703108274"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Firestore
const db = firebase.firestore();

// Initialiser Auth
const auth = firebase.auth();

// Charger Pyodide
async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
}

loadPyodideAndPackages();

// Authentification
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log("Tentative de connexion avec l'email : ", email); // Debug

    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert('Connexion réussie !');
        document.getElementById('auth-container').style.display = 'none';
        document.querySelector('textarea').style.display = 'block';
        document.querySelector('.buttons').style.display = 'block';
        document.getElementById('output-area').style.display = 'block';
    } catch (error) {
        document.getElementById('auth-error').textContent = error.message;
    }
});

document.getElementById('signup-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log("Tentative d'inscription avec l'email : ", email); // Debug

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Inscription réussie !');
    } catch (error) {
        document.getElementById('auth-error').textContent = error.message;
    }
});

// Exécuter le code Python
document.getElementById('run-code').addEventListener('click', async () => {
    const code = document.getElementById('code-editor').value;
    try {
        const output = await pyodide.runPythonAsync(code);
        document.getElementById('output-area').textContent = output;
    } catch (err) {
        document.getElementById('output-area').textContent = `Error: ${err}`;
    }
});

// Sauvegarder le code dans le cloud
async function saveCodeToCloud(code) {
    const user = auth.currentUser;
    if (user) {
        db.collection("code-saves").add({
            uid: user.uid,
            email: user.email,
            code: code,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert('Code sauvegardé dans le cloud!');
        }).catch((error) => {
            console.error('Erreur lors de la sauvegarde : ', error);
        });
    } else {
        alert('Veuillez vous connecter pour sauvegarder le code.');
    }
}

// Sauvegarder le code
document.getElementById('save-code').addEventListener('click', () => {
    const code = document.getElementById('code-editor').value;
    saveCodeToCloud(code);  // Sauvegarde sur Firebase

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pamor_snake_code.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Charger le code depuis Firebase
async function loadCodeFromCloud() {
    const user = auth.currentUser;
    if (user) {
        const querySnapshot = await db.collection("code-saves").where("uid", "==", user.uid).orderBy("timestamp", "desc").limit(1).get();
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                document.getElementById('code-editor').value = doc.data().code;
                alert('Code chargé depuis le cloud!');
            });
        } else {
            alert('Aucune sauvegarde trouvée pour cet utilisateur.');
        }
    } else {
        alert('Veuillez vous connecter pour charger le code.');
    }
}

// Charger le code du cloud
document.getElementById('load-cloud-code').addEventListener('click', loadCodeFromCloud);

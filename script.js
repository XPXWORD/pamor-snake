let pyodide = null;

async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
    console.log("Pyodide loaded");
}

loadPyodideAndPackages();

document.getElementById('add-block').addEventListener('click', () => {
    const block = document.createElement('div');
    block.classList.add('block');

    const textarea = document.createElement('textarea');
    block.appendChild(textarea);

    const runButton = document.createElement('button');
    runButton.textContent = 'Exécuter le bloc';
    runButton.addEventListener('click', async () => {
        const code = textarea.value;
        console.log("Exécution du code:", code);
        
        try {
            const output = await pyodide.runPythonAsync(code);
            document.getElementById('output-area').textContent += output + "\n";
            console.log("Code exécuté avec succès");
        } catch (err) {
            document.getElementById('output-area').textContent += `Erreur: ${err}\n`;
            console.error('Erreur lors de l\'exécution du code:', err);
        }
    });
    block.appendChild(runButton);
    
    document.getElementById('blocks-container').appendChild(block);
});

document.getElementById('save-code').addEventListener('click', () => {
    const blocks = document.querySelectorAll('.block textarea');
    const codeArray = Array.from(blocks).map(block => block.value);
    localStorage.setItem('savedCode', JSON.stringify(codeArray));
    alert('Code sauvegardé localement!');
});

document.getElementById('load-code').addEventListener('click', () => {
    const savedCode = JSON.parse(localStorage.getItem('savedCode'));
    if (savedCode) {
        const blocksContainer = document.getElementById('blocks-container');
        blocksContainer.innerHTML = ''; // Effacer les anciens blocs
        savedCode.forEach(code => {
            const block = document.createElement('div');
            block.classList.add('block');

            const textarea = document.createElement('textarea');
            textarea.value = code;
            block.appendChild(textarea);

            const runButton = document.createElement('button');
            runButton.textContent = 'Exécuter le bloc';
            runButton.addEventListener('click', async () => {
                const code = textarea.value;
                console.log("Exécution du code:", code);
                
                try {
                    const output = await pyodide.runPythonAsync(code);
                    document.getElementById('output-area').textContent += output + "\n";
                    console.log("Code exécuté avec succès");
                } catch (err) {
                    document.getElementById('output-area').textContent += `Erreur: ${err}\n`;
                    console.error('Erreur lors de l\'exécution du code:', err);
                }
            });
            block.appendChild(runButton);
            
            blocksContainer.appendChild(block);
        });
        alert('Code chargé!');
    } else {
        alert('Aucune sauvegarde trouvée!');
    }
});

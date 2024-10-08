let pyodide = null;

async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
}

loadPyodideAndPackages();

document.getElementById('add-code-block').addEventListener('click', () => {
    const codeBlocksDiv = document.getElementById('code-blocks');
    const newBlock = document.createElement('div');
    newBlock.classList.add('code-block');
    
    newBlock.innerHTML = `
        <textarea class="code-editor" placeholder="Write your Python code here..."></textarea>
        <button class="run-button">Run Code</button>
    `;
    
    codeBlocksDiv.appendChild(newBlock);
    
    const runButton = newBlock.querySelector('.run-button');
    runButton.addEventListener('click', async () => {
        const code = newBlock.querySelector('.code-editor').value;
        try {
            const output = await pyodide.runPythonAsync(code);
            document.getElementById('output-area').textContent += `Output:\n${output}\n`;
        } catch (err) {
            document.getElementById('output-area').textContent += `Error:\n${err}\n`;
        }
    });
});

document.getElementById('save-code').addEventListener('click', () => {
    const codeEditors = document.querySelectorAll('.code-editor');
    const codeData = Array.from(codeEditors).map(editor => editor.value);
    localStorage.setItem('savedCodeBlocks', JSON.stringify(codeData));
    alert('Code saved locally!');
});

document.getElementById('load-code').addEventListener('click', () => {
    const codeData = JSON.parse(localStorage.getItem('savedCodeBlocks'));
    if (codeData) {
        const codeBlocksDiv = document.getElementById('code-blocks');
        codeBlocksDiv.innerHTML = '';
        codeData.forEach(code => {
            const newBlock = document.createElement('div');
            newBlock.classList.add('code-block');
            newBlock.innerHTML = `
                <textarea class="code-editor" placeholder="Write your Python code here...">${code}</textarea>
                <button class="run-button">Run Code</button>
            `;
            codeBlocksDiv.appendChild(newBlock);
            
            const runButton = newBlock.querySelector('.run-button');
            runButton.addEventListener('click', async () => {
                const code = newBlock.querySelector('.code-editor').value;
                try {
                    const output = await pyodide.runPythonAsync(code);
                    document.getElementById('output-area').textContent += `Output:\n${output}\n`;
                } catch (err) {
                    document.getElementById('output-area').textContent += `Error:\n${err}\n`;
                }
            });
        });
    } else {
        alert('No saved code found!');
    }
});

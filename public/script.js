function generateLandingPage() {
    const formData = new FormData(document.getElementById('immobilierForm'));

    // Envoi du contenu de la page au serveur avec les images
    const xhr = new XMLHttpRequest();
    const url = './savePage.php';

    xhr.open('POST', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const fileName = xhr.responseText;
            const successMessage = `Votre landing page a été créée avec succès. Voici le lien :`;
            const link = `www.zebrito.fr/${fileName}`;
            const successContainer = document.createElement('div');

            successContainer.innerHTML = `
                <p>${successMessage}</p>
                <div id="linkContainer">
                    <span id="generatedLink">${link}</span>
                    <button onclick="copyToClipboard()">Copier</button>
                </div>
            `;

            document.getElementById('immobilierForm').appendChild(successContainer);
        }
    };

    xhr.send(formData);
}

// Appeler la fonction generateLandingPage lors du clic sur le bouton
document.getElementById('submitBtn').addEventListener('click', generateLandingPage);

// Fonction pour copier le lien dans le presse-papiers
function copyToClipboard() {
    const linkElement = document.getElementById('generatedLink');
    const range = document.createRange();
    range.selectNode(linkElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    alert('Lien copié dans le presse-papiers !');
}

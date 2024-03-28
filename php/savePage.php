<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Génération du contenu de la page HTML
    $landingPageContent = '
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Landing Page Template</title>
            <link rel="stylesheet" href="styles_lp.css">
            <style>
                body {
                    background-image: url("images/' . $_FILES['backgroundImage']['name'] . '");
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>' . $_POST['propertyType'] . ' à ' . $_POST['city'] . ', ' . $_POST['country'] . '</h1>
                <div class="property-info">
                    <p>Surface: ' . $_POST['area'] . ' m²</p>
                    <p>Prix: ' . $_POST['price'] . ' euros</p>
                    <p>Pièces: ' . $_POST['rooms'] . '</p>
                    <p>Salle(s) de bain: ' . $_POST['bathrooms'] . '</p>
                </div>
                <div id="imageContainer">
                    <img src="images/' . $_FILES['image1']['name'] . '" alt="Image 1">
                    <img src="images/' . $_FILES['image2']['name'] . '" alt="Image 2">
                </div>
            </div>
        </body>
        </html>
    ';

    // Écriture du contenu complet dans le fichier
    $fileName = generateRandomString() . ".html";
    $filePath = "./" . $fileName;
    file_put_contents($filePath, $landingPageContent);

    // Gestion des fichiers d'image
    $image1 = $_FILES['image1'];
    $image2 = $_FILES['image2'];
    $backgroundImage = $_FILES['backgroundImage'];

    // Déplacer les fichiers téléchargés vers le dossier approprié
    move_uploaded_file($image1['tmp_name'], "./images/" . $image1['name']);
    move_uploaded_file($image2['tmp_name'], "./images/" . $image2['name']);
    move_uploaded_file($backgroundImage['tmp_name'], "./images/" . $backgroundImage['name']);

    // Retournez le nom du fichier généré pour la redirection
    echo $fileName;
} else {
    // Redirection vers la page d'accueil si la requête n'est pas POST
    header("Location: index.html");
    exit();
}

function generateRandomString() {
    return 'lp' . substr(str_shuffle(str_repeat("0123456789abcdefghijklmnopqrstuvwxyz", 5)), 0, 5);
}
?>

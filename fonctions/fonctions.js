const { config } = require('./../configurations/_app.config')
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

async function getPageWithRandomHeaders(page) {
    const userAgentList = config.agentsUtilisateurs;
    const acceptLanguageList = config.langues;
    const refererList = config.moteurDeRecherche;

    const randomUserAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];
    const randomAcceptLanguage = acceptLanguageList[Math.floor(Math.random() * acceptLanguageList.length)];
    const randomReferer = refererList[Math.floor(Math.random() * refererList.length)];


    await page.setExtraHTTPHeaders({
        'User-Agent': randomUserAgent, // Changer l'User-Agent pour éviter la détection
        'Accept-Language': randomAcceptLanguage, // Changer la langue pour éviter la détection
        'Referer': randomReferer, // Changer le referer pour éviter la détection
        'Connection': 'keep-alive', // Indiquer une connexion persistante
        'Cache-Control': 'no-cache', // Désactiver la mise en cache
        'Upgrade-Insecure-Requests': '1', // Indiquer une requête sécurisée
        'Accept-Encoding': 'gzip, deflate, br', // Accepter la compression
        'Sec-Fetch-Dest': 'document', // Indiquer le type de ressource demandée
        'Sec-Fetch-Mode': 'navigate', // Indiquer le mode de navigation
        'Sec-Fetch-Site': 'none', // Indiquer le site de la ressource demandée
        'Sec-Fetch-User': '?1', // Indiquer la présence ou non d'un utilisateur
    });

    return page;
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function waitForTimeout(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function fonctionRetry(
    page,
    {
        nombreEssais = 1,
        maxEssais = 5,
        dureeAttente = 5000,
        messageSuccess = "success",
        messageError = "error",
        messageAttente = "",
        showMessage = false,
        back = false,
        showError = true,
        contentFunction = async () => { },
        contentFunctionError = async () => { },

    }
) {
    let success = false;

    while (nombreEssais <= maxEssais && !success) {
        try {
            await contentFunction();
            success = true;
            if (showMessage) {
                console.log(`✅ ${messageSuccess} après ${nombreEssais} tentative(s)`);
            }
        } catch (e) {
            if (nombreEssais === maxEssais) {
                if (showError) {
                    console.error(`❌ Erreur ${messageError}`);
                }
                await contentFunctionError();
                break;
            }

            else if (nombreEssais <= maxEssais) {
                var timeWait = 0;
                if (dureeAttente >= 1000) {
                    timeWait = dureeAttente / 1000;
                    console.error(`🕥 Attente = ${messageAttente} = de ${timeWait} secondes...`);
                } else {
                    timeWait = dureeAttente;
                    console.error(`🕥 Attente = ${messageAttente} = de ${timeWait} millisecondes...`);
                }

                await page.waitForTimeout(dureeAttente);
                if (back && nombreEssais === maxEssais) {
                    await page.goBack();
                    console.log("🔙 back");
                }
            }

            nombreEssais++;

        }
    }
}


function getLastPosition() {
    const indexPath = './fichiers/index_save.txt';

    try {
        const content = fs.readFileSync(indexPath, 'utf-8');
        const lastPositionSave = parseInt(content);
        return lastPositionSave;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Le fichier n'existe pas, créer le fichier avec une valeur par défaut de 0
            fs.writeFileSync(indexPath, '1', 'utf-8');
            return 1;
        } else {
            // Le fichier existe mais est vide, ajouter 0 à l'intérieur
            fs.writeFileSync(indexPath, '1', 'utf-8');
            return 1;
        }
    }
}


async function sauvegardeDataToJson(listJson, index, totalSurLaPage) {
    const savePath = './fichiers/data_save.json';
    const indexPath = './fichiers/index_save.txt';

    // Vérifier si le fichier JSON existe déjà, sinon le créer avec un tableau vide
    let jsonData = [];
    if (fs.existsSync(savePath)) {
        const existingData = fs.readFileSync(savePath);
        jsonData = JSON.parse(existingData);
    } else {
        fs.writeFileSync(savePath, '[]');
    }

    // Fusionner les nouvelles valeurs avec les données existantes
    jsonData = jsonData.concat(listJson);

    // Convertir les données en format JSON
    const dataToSave = JSON.stringify(jsonData, null, 2);

    // Écrire les données dans le fichier JSON
    fs.writeFileSync(savePath, dataToSave);

    // Sauvegarder l'index dans un fichier texte
    fs.writeFileSync(indexPath, `${index}`);

    console.log('📁 Save pour index = ' + index + ', Qte = ' + listJson.length + ' / ' + totalSurLaPage);
}


async function sauvegardeTest(listJson) {
    const savePath = './fichiers/test.json';

    // Vérifier si le fichier JSON existe déjà, sinon le créer avec un tableau vide
    let jsonData = [];
    if (fs.existsSync(savePath)) {
        const existingData = fs.readFileSync(savePath);
        jsonData = JSON.parse(existingData);
    } else {
        fs.writeFileSync(savePath, '[]');
    }

    // Fusionner les nouvelles valeurs avec les données existantes
    jsonData = jsonData.concat(listJson);

    // Convertir les données en format JSON
    const dataToSave = JSON.stringify(jsonData, null, 2);

    // Écrire les données dans le fichier JSON
    fs.writeFileSync(savePath, dataToSave);

    console.log('📁 Save test ok!');
}






async function convertJsonToCsv() {
    const pathJson = './fichiers/purje.json';
    const csvFilePath = './fichiers/particulier_canada.csv';

    try {
        console.log('Debut de la conversion du fichier excel');

        // Lecture du fichier JSON
        const jsonData = fs.readFileSync(pathJson, 'utf8');
        const data = JSON.parse(jsonData);

        // Création du fichier CSV
        const csvWriter = createObjectCsvWriter({
            path: csvFilePath,
            header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
        });

        await csvWriter.writeRecords(data);
        console.log('Conversion JSON vers CSV réussie.');
    } catch (error) {
        console.error('Erreur lors de la conversion JSON vers CSV :', error);
    }
}

// Fonction pour afficher le nombre d'éléments dans le fichier
function tailleFichierJson() {
    const filePath = './fichiers/data_save.json';
    const pathPurjeJson = './fichiers/purje.json';

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const data2 = fs.readFileSync(pathPurjeJson, 'utf8');
        const jsonData = JSON.parse(data);
        const jsonData2 = JSON.parse(data2);
        const count = jsonData.length;
        const count2 = jsonData2.length;
        console.log(`Le fichier contient ${count} élément(s).`);
        console.log(`Le fichier contient purjer ${count2} élément(s).`);
        console.log(`Mauvaises donner = ${count - count2}`);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier :', error);
    }
}


// Fonction de mélange aléatoire d'un tableau (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fonction principale pour filtrer et manipuler le fichier JSON
async function purjeJson() {
    const pathJsonInitial = './fichiers/data_save.json';
    const pathPurjeJson = './fichiers/purje.json';

    try {
        if (fs.existsSync(pathPurjeJson)) {
            console.log('Debut de la purje du fichier excel');
            // Lecture du fichier JSON initial
            const jsonData = fs.readFileSync(pathJsonInitial, 'utf8');
            let data = JSON.parse(jsonData);

            // Filtre : Supprimer les objets qui ont un code postal avec moins de 6 caractères et vérifier le format du code postal (majuscules, sans accents)
            data = data.filter(item => item.nom.length > 3 && item.prenom.length > 3);

            // Filtre : Supprimer les objets qui ont un code postal avec moins de 6 caractères
            data = data.filter(item => item.codePostal.length >= 6 && /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(item.codePostal.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));

            // Filtre : Supprimer les objets qui ont le même nom et le même prénom
            data = data.filter((item, index, self) => self.findIndex(i => i.nom === item.nom && i.prenom === item.prenom) === index);

            // Filtre : Supprimer les objets identiques
            data = data.filter((item, index, self) => self.findIndex(i => JSON.stringify(i) === JSON.stringify(item)) === index);

            // Filtre : Supprimer les objets ayant le même code postal
            data = data.filter((item, index, self) => self.findIndex(i => i.codePostal === item.codePostal) === index);

            // Créer un ensemble pour suivre les numéros de téléphone déjà rencontrés
            const phoneNumbersSet = new Set();
            data = data.filter(item => {
                if (phoneNumbersSet.has(item.numeroTelephone)) {
                    return false; // Ne pas conserver le doublon
                }
                phoneNumbersSet.add(item.numeroTelephone);
                return true; // Conserver le premier exemplaire du numéro de téléphone
            });


            // Mélange aléatoire des données
            data = shuffleArray(data);

            // Écriture des données filtrées et mélangées dans le nouveau fichier JSON
            fs.writeFileSync(pathPurjeJson, JSON.stringify(data, null, 2), 'utf8');

            console.log('Filtrage et mélange du fichier JSON réussis.');
        } else {
            fs.writeFileSync(pathPurjeJson, '[]');
        }
    } catch (error) {
        console.error('Erreur lors du filtrage du fichier JSON :', error);
    }
}


module.exports = {
    getPageWithRandomHeaders,
    randomInt,
    fonctionRetry,
    sauvegardeDataToJson,
    waitForTimeout,
    sauvegardeTest,
    tailleFichierJson,
    convertJsonToCsv,
    purjeJson,
    getLastPosition
};
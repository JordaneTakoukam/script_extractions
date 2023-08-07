const puppeteer = require('puppeteer-extra')
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY }))


const { config } = require('./../configurations/_app.config')
const { getPageWithRandomHeaders } = require('./../fonctions/fonctions')

async function lancerLeNavigateur() {
    const args = [
        "--single-process",
        "--no-zygote",
        '--disable-features=site-per-process', // désactiver l'isolation de site
        '--no-sandbox', // Désactivation du mode sandbox pour éviter les erreurs de lancement de Chrome
        '--disable-setuid-sandbox', // Désactivation du mode setuid-sandbox pour éviter les erreurs de lancement de Chrome
        '--disable-dev-shm-usage', // Utilisation d'un espace mémoire partagé pour éviter les erreurs de mémoire
        '--disable-accelerated-2d-canvas', // Désactivation du rendu accéléré 2D pour éviter les erreurs de mémoire
        '--disable-gpu', // Désactivation de l'accélération GPU pour éviter les erreurs de mémoire
        '--disable-background-networking', // Désactivation du réseau en arrière-plan pour économiser la bande passante et accélérer le lancement de Chrome
        '--disable-background-timer-throttling', // Désactivation du throttling des timers en arrière-plan pour accélérer le lancement de Chrome
        '--disable-breakpad', // Désactivation de la génération de rapports de plantage pour accélérer le lancement de Chrome
        '--disable-client-side-phishing-detection', // Désactivation de la détection de phishing côté client pour accélérer le lancement de Chrome
        '--disable-component-extensions-with-background-pages', // Désactivation des extensions avec des pages en arrière-plan pour accélérer le lancement de Chrome
        '--disable-default-apps', // Désactivation des applications par défaut pour accélérer le lancement de Chrome
        '--disable-extensions', // Désactivation de toutes les extensions pour accélérer le lancement de Chrome
    ];

    try {
        return await puppeteer.launch({
            headless: config.mode === "dev" ? false : true,
            args: args,
            executablePath: puppeteer.executablePath(),
        });
    }
    catch (e) {
        console.log('IMPOSSIBLE DE LANCER LE NAVIGATEUR')

        return null;
    }

}



async function lancerLeSiteWeb({ browserInstance, url }) {

    const intitPage = await browserInstance.newPage();
    const page = await getPageWithRandomHeaders(intitPage);
    await page.setViewport({ width: 1600, height: 800 });


    page.on('request', async (request) => {
        // Ignorer les requêtes liées à la section de code spécifique
        if (
            request.resourceType() === 'image'
            // request.resourceType() === 'image' || request.url().includes('ypgmap') ||
            // || request.resourceType() === 'script'
            //  || request.resourceType() === 'stylesheet'
        ) {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle2', ignoreHTTPSErrors: true });

        return page;

    } catch (error) {
        console.log('IMPOSSIBLE DE LANCER LE SITE')
        await page.close();
        await browserInstance.close();
    }
}






module.exports = { lancerLeNavigateur, lancerLeSiteWeb };
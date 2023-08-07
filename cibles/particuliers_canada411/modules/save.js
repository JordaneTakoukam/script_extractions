const { listeDeNom, listeDeVilles } = require('../../../fichiers/data');
const { randomInt, fonctionRetry, sauvegardeDataToJson, waitForTimeout } = require('./../../../fonctions/fonctions');

async function processusParticulierCanada411({ page, selecteur }) {
    var totalResultInt;
    var initalVille = null;
    var initialName = null;
    // Récupérer toutes les valeurs sur la page
    var quantite = 100;
    var listPremiereResult = [];
    var listSecondResult = [];

    var initialIndex = 92;
    var index = 93;

    await fonctionRetry(page, {
        nombreEssais: 1,
        maxEssais: 5,
        dureeAttente: 10000,
        messageSuccess: "initial data",
        messageError: "initial data",
        messageAttente: "initial data",
        showMessage: false,
        contentFunction: async () => {
            initalVille = listeDeVilles[randomInt(0, listeDeVilles.length)];
            initialName = listeDeNom[initialIndex];
        }
    });


    await fonctionRetry(page, {
        nombreEssais: 1,
        maxEssais: 3,
        dureeAttente: 10000,
        messageSuccess: "input 1 et 2",
        messageError: "input 1 et 2",
        messageAttente: "input 1 et 2",
        showMessage: false,
        contentFunction: async () => {
            await page.waitForSelector(selecteur.input1, { visible: true });
            await page.waitForSelector(selecteur.input2, { visible: true });

            await page.type(selecteur.input1, initialName, { delay: 10 });

            await page.waitForTimeout(randomInt(100));
            await page.type(selecteur.input2, initalVille, { delay: 10 });

            await page.keyboard.press('Enter');

            await fonctionRetry(page, {
                nombreEssais: 1,
                maxEssais: 3,
                dureeAttente: 10000,
                messageSuccess: "first total result",
                messageError: "first total result",
                messageAttente: "first total result",
                showMessage: false,
                back: false,
                contentFunction: async () => {
                    await page.waitForSelector("div.c411ResultsTop h1", { visible: true });
                    const totalResultText = await page.$eval("div.c411ResultsTop h1", el => el.textContent) ?? 0;
                    totalResultInt = parseInt(totalResultText.match(/\d+/)[0]);
                }
            });

            await waitForTimeout(randomInt(500, 1000))
        }
    });


    // passer de 15 a 25
    if (totalResultInt > 25) {
        await fonctionRetry(page, {
            nombreEssais: 1,
            maxEssais: 5,
            dureeAttente: 10000,
            messageSuccess: "Modification du nbre de resultat de la page de 15 a 25",
            messageError: "Erreur lors de la modification du nbre page de 15 a 25",
            messageAttente: "passer de 15 a 25",
            contentFunction: async () => {
                await page.click('select[name="pglen"]');
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                await waitForTimeout(500);
            }
        });
    }

    var currentQuantite = quantite;

    if (totalResultInt < quantite) {
        quantite = totalResultInt;
        currentQuantite = totalResultInt;
    }

    while (currentQuantite > 0) {
        const elements = await page.$$eval('.c411Listing.jsResultsList', (liElements, initalVille) => {
            return liElements.map(li => {
                const nomComplet = li.querySelector('.c411ListedName a')?.textContent.trim() || null;
                const mots = nomComplet.trim().split(' ');
                let nom = '';
                let prenom = '';
                if (mots.length >= 2) {
                    nom = mots[mots.length - 1];
                    prenom = mots.slice(0, mots.length - 1).join(' ');
                } else if (mots.length === 1) {
                    prenom = mots[0];
                }
                const numeroTelephone = li.querySelector('.c411Phone')?.textContent.trim() || null;
                const adresseComplete = li.querySelector('.c411ListingGeo .adr')?.textContent.trim() || null;
                const ville = adresseComplete ? initalVille : null;
                const codePostal = adresseComplete ? adresseComplete.substr(-7) : null;

                return { nom, prenom, numeroTelephone, adresseComplete, ville, codePostal };
            });
        }, initalVille);

        listPremiereResult.push(...elements.slice(0, currentQuantite));

        // si on atteint pas le qota on click sur next pour ajouter a la liste
        if (totalResultInt > 25 && listPremiereResult.length < quantite) {
            if (await page.waitForSelector('li.pagingNext a', { visible: true })) {
                await fonctionRetry(page, {
                    nombreEssais: 1,
                    maxEssais: 10,
                    dureeAttente: 10000,
                    messageSuccess: "⏭ button next",
                    messageError: "click button next",
                    messageAttente: 'button next',
                    contentFunction: async () => {
                        await page.click('li.pagingNext a');
                    },
                });
            }

        }
        // Mise à jour du nombre d'éléments restants à récupérer
        currentQuantite -= elements.length;
    }

    sauvegardeDataToJson(listPremiereResult, initialIndex);

    // ==================================================== //
    if (listeDeNom.length > 1) {
        var resultatTotalNext = 0;

        // boucle pour parcourir les elements 1 a 1 , partant du 2ie elem de la liste
        while (index < listeDeNom.length) {
            listSecondResult = [];

            await fonctionRetry(page, {
                nombreEssais: 1,
                maxEssais: 2,
                dureeAttente: 10000,
                messageSuccess: "input 3 et 4",
                messageError: "input 3 et 4",
                messageAttente: "input 3 et 4",
                showMessage: false,
                contentFunction: async () => {
                    await page.waitForSelector(selecteur.input3, { visible: true });
                    await page.waitForSelector(selecteur.input4, { visible: true });

                    const input3 = await page.$(selecteur.input3);
                    const input4 = await page.$(selecteur.input4);

                    // efface l'input 3
                    await input3.click({ clickCount: 3, delay: 5 });
                    await waitForTimeout(50);

                    // on saisie le prochain nom
                    await page.type(selecteur.input3, listeDeNom[index], { delay: 5 });
                    await waitForTimeout(50);

                    // efface l'input 4
                    await input4.click({ clickCount: 3, delay: 10 });
                    await waitForTimeout(50);

                    // on saisie la prochaine ville
                    await page.type(selecteur.input4, listeDeVilles[randomInt(0, listeDeVilles.length)], { delay: randomInt(50, 100) });
                    await waitForTimeout(300);

                    // on valide la recherche
                    await page.keyboard.press('Enter');

                    // on attend que le resultat sois visible
                    await page.waitForSelector("div.c411ResultsTop h1", { visible: true });
                }
            });


            await fonctionRetry(page, {
                nombreEssais: 1,
                maxEssais: 3,
                dureeAttente: 10000,
                messageSuccess: "total page",
                messageError: "total page",
                messageAttente: "total paget",
                showMessage: false,
                back: true,
                contentFunction: async () => {
                    const totalResultText = await page.$eval("div.c411ResultsTop h1", el => el.textContent);
                    resultatTotalNext = parseInt(totalResultText.match(/\d+/)[0]);
                }
            });

            // passer de 15 a 25
            if (resultatTotalNext > 25) {
                await fonctionRetry(page, {
                    nombreEssais: 1,
                    maxEssais: 5,
                    dureeAttente: 10000,
                    messageSuccess: "passer de 15 a 25",
                    messageError: "passer de 15 a 25",
                    messageAttente: "passer de 15 a 25",
                    contentFunction: async () => {
                        await page.click('select[name="pglen"]');
                        await page.keyboard.press('ArrowDown');
                        await page.keyboard.press('Enter');
                        await waitForTimeout(500);
                    }
                });
            }

            // on initialise a chaque nouvel element 
            currentQuantite = quantite;

            if (quantite > resultatTotalNext) {
                quantite = resultatTotalNext;
                currentQuantite = resultatTotalNext;
            }

            //
            // boucle pour faire une NEXT PAGE si necessaire
            while (currentQuantite > 0) {
                var elements = null;
                await fonctionRetry(page, {
                    nombreEssais: 1,
                    maxEssais: 5,
                    dureeAttente: 10000,
                    messageSuccess: "get elements on page",
                    messageError: "get elements on page",
                    messageAttente: 'get elements on page',
                    showMessage: false,
                    contentFunction: async () => {
                        elements = await page.$$eval('.c411Listing.jsResultsList', (liElements, initalVille) => {
                            return liElements.map(li => {
                                const nomComplet = li.querySelector('.c411ListedName a')?.textContent.trim() || null;
                                const mots = nomComplet.trim().split(' ');
                                let nom = '';
                                let prenom = '';
                                if (mots.length >= 2) {
                                    nom = mots[mots.length - 1];
                                    prenom = mots.slice(0, mots.length - 1).join(' ');
                                } else if (mots.length === 1) {
                                    prenom = mots[0];
                                }
                                const numeroTelephone = li.querySelector('.c411Phone')?.textContent.trim() || null;
                                const adresseComplete = li.querySelector('.c411ListingGeo .adr')?.textContent.trim() || null;
                                const ville = adresseComplete ? initalVille : null;
                                const codePostal = adresseComplete ? adresseComplete.substr(-7) : null;

                                return { nom, prenom, numeroTelephone, adresseComplete, ville, codePostal };
                            });
                        }, initalVille);

                        listSecondResult.push(...elements.slice(0, currentQuantite));

                        // bouton next
                        if (resultatTotalNext > 25 && listSecondResult.length < quantite) {
                            if (await page.waitForSelector('li.pagingNext a', { visible: true })) {
                                await fonctionRetry(page, {
                                    nombreEssais: 1,
                                    maxEssais: 10,
                                    dureeAttente: 10000,
                                    messageSuccess: "⏭ button next",
                                    messageError: "click button next",
                                    messageAttente: 'button next',
                                    contentFunction: async () => {
                                        await page.click('li.pagingNext a');
                                    },
                                });
                            }


                        }
                    },

                });
                // Mise à jour du nombre d'éléments restants à récupérer
                currentQuantite -= elements.length;
            }


            if (listSecondResult.length > 0) {
                console.log(listSecondResult.length)
                sauvegardeDataToJson(listSecondResult, index);
            }
            index++;
        }
    }
}



module.exports = { processusParticulierCanada411 };
const { listeDeNom, listeDeVilles } = require('../../../fichiers/data');
const { randomInt, fonctionRetry, sauvegardeDataToJson, waitForTimeout, sauvegardeTest } = require('./../../../fonctions/fonctions');

async function processusParticulierCanada411({ page, selecteur }) {
    var totalResultatPage = null;
    var initalVille = null;
    var initialName = null;
    // Récupérer toutes les valeurs sur la page
    var qteDefini = 100;
    var listPremierResult = [];

    var initialIndex = 423;
    var index = 424;

    await fonctionRetry(page, {
        nombreEssais: 1,
        maxEssais: 2,
        dureeAttente: 10000,
        messageSuccess: "initial data",
        messageError: "initial data",
        messageAttente: "initial data",
        showMessage: false,
        contentFunction: async () => {
            initalVille = listeDeVilles[randomInt(0, listeDeVilles.length)];
            initialName = listeDeNom[initialIndex];
        }, contentFunctionError: async () => {
            page.close();
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
        },
        contentFunctionError: async () => {
            page.close();
        }
    });

    console.log("👇 index : " + initialIndex + ' / ' + listeDeNom.length);
    await fonctionRetry(page, {
        nombreEssais: 1,
        maxEssais: 3,
        dureeAttente: 3000,
        messageSuccess: "Total",
        messageError: "Total",
        messageAttente: "Total",
        showMessage: false,
        contentFunction: async () => {
            await waitForTimeout(2000);

            await page.waitForSelector("div.c411ResultsTop h1", { visible: true });
            const totalResultText = await page.$eval("div.c411ResultsTop h1", el => el.textContent) ?? 0;
            totalResultatPage = parseInt(totalResultText.match(/\d+/)[0]);
            // console.log('T = ' + totalResultatPage);
        }
    });


    // passer de 15 a 25
    if (totalResultatPage > 25) {
        try {
            await fonctionRetry(page, {
                nombreEssais: 1,
                maxEssais: 5,
                dureeAttente: 10000,
                messageSuccess: "Modification du nbre de resultat de la page de 15 a 25",
                messageError: "Erreur lors de la modification du nbre page de 15 a 25",
                messageAttente: "passer de 15 a 25",
                showMessage: false,
                contentFunction: async () => {
                    await page.waitForSelector('.c411Listing.jsResultsList', { visible: true });
                    await page.click('select[name="pglen"]');
                    await page.keyboard.press('ArrowDown');
                    await page.keyboard.press('Enter');
                    await page.waitForSelector('.c411Listing.jsResultsList', { visible: true });
                }
            });
        } catch (e) { console.log('error passer de 15-25'); }
    }

    let qtePossible = qteDefini;

    if (totalResultatPage < qteDefini) {
        qtePossible = totalResultatPage;
    }
    let indexPage = 2;

    while (qtePossible > 0) {
        let elements = [];
        await fonctionRetry(page, {
            nombreEssais: 1,
            maxEssais: 3,
            dureeAttente: 10000,
            messageSuccess: "get second elements",
            messageError: "get second elements",
            messageAttente: 'get second elements',
            contentFunction: async () => {
                while (elements.length === 0) {
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
                }
            }
        });

        listPremierResult.push(...elements.slice(0, qtePossible));

        try {
            if (listPremierResult.length < qtePossible) {
                await fonctionRetry(page, {
                    nombreEssais: 1,
                    maxEssais: 3,
                    dureeAttente: 10000,
                    messageSuccess: "⏭  B.Next page = [ " + indexPage + ' ]',
                    messageError: "B.Next",
                    messageAttente: "B.Next",
                    showMessage: true,
                    contentFunction: async () => {
                        indexPage++;
                        // resultatTotalNext -= 25;
                        await page.waitForSelector('li.pagingNext a', { visible: true });
                        await page.click('li.pagingNext a');
                    }
                });
            }
        } catch (e) {
            console.log('...pas de bouton next ');
            break;
        }
        // Mise à jour du nombre d'éléments restants à récupérer
        qtePossible -= elements.length;
    }


    sauvegardeDataToJson(listPremierResult, initialIndex, totalResultatPage);


    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    // 
    //==================================================== //
    if (listeDeNom.length > 1) {

        //  boucle pour parcourir les elements 1 a 1 , partant du 2ie elem de la liste
        while (index < listeDeNom.length) {
            console.log("\n👇 index : " + index + ' / ' + listeDeNom.length);

            let listSecondResult = [];
            let resultatTotalNext = 0;

            await fonctionRetry(page, {
                nombreEssais: 1,
                maxEssais: 3,
                dureeAttente: 10000,
                messageSuccess: "input 3 et 4",
                messageError: "input 3 et 4",
                messageAttente: "input 3 et 4",
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
                }
            });

            await fonctionRetry(page, {
                nombreEssais: 1,
                maxEssais: 2,
                dureeAttente: 3000,
                messageSuccess: "Total",
                messageError: "Total",
                messageAttente: "Total",
                contentFunction: async () => {
                    await waitForTimeout(3000);
                    await page.waitForSelector("div.c411ResultsTop h1", { visible: true });
                    const val = await page.$eval("div.c411ResultsTop h1", el => el.textContent);
                    resultatTotalNext = parseInt(val.match(/\d+/)[0]);
                }
            });

            // console.log('T = ' + resultatTotalNext);

            if (resultatTotalNext > 0) {
                if (resultatTotalNext > 25) {
                    // passer de 15 a 25
                    await fonctionRetry(page, {
                        nombreEssais: 1,
                        maxEssais: 3,
                        dureeAttente: 10000,
                        messageSuccess: "passer de 15 a 25",
                        messageError: "passer de 15 a 25",
                        messageAttente: "passer de 15 a 25",
                        contentFunction: async () => {
                            await page.waitForSelector('.c411Listing.jsResultsList', { visible: true });
                            await page.click('select[name="pglen"]');
                            await page.keyboard.press('ArrowDown');
                            await page.keyboard.press('Enter');
                        }
                    });
                }

                let qtePossibleNext = qteDefini;

                if (resultatTotalNext < qteDefini) {
                    qtePossibleNext = resultatTotalNext;
                }
                let indexNextPage = 2;

                //
                // boucle pour faire une NEXT PAGE si necessaire
                while (qtePossibleNext > 0) {
                    let elementsNext = [];

                    await fonctionRetry(page, {
                        nombreEssais: 1,
                        maxEssais: 3,
                        dureeAttente: 10000,
                        messageSuccess: "get second elements",
                        messageError: "get second elements",
                        messageAttente: 'get second elements',
                        contentFunction: async () => {
                            while (elementsNext.length === 0) {
                                elementsNext = await page.$$eval('.c411Listing.jsResultsList', (liElements, initalVille) => {
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
                            }
                        }
                    });

                    listSecondResult.push(...elementsNext.slice(0, qtePossibleNext));

                    // si on atteint pas le qota on click sur next pour ajouter a la liste
                    try {
                        if (listSecondResult.length < qtePossibleNext) {
                            await fonctionRetry(page, {
                                nombreEssais: 1,
                                maxEssais: 3,
                                dureeAttente: 10000,
                                messageSuccess: "⏭  B.Next page = [ " + indexNextPage + ' ]',
                                messageError: "B.Next",
                                messageAttente: "B.Next",
                                showMessage: true,
                                contentFunction: async () => {
                                    indexNextPage++;
                                    // resultatTotalNext -= 25;
                                    await page.waitForSelector('li.pagingNext a', { visible: true });
                                    await page.click('li.pagingNext a');
                                },
                                contentFunctionError: async () => {
                                    qtePossibleNext = 0;
                                }
                            });
                        }
                    } catch (e) {
                        console.log('...pas de bouton next ');
                        break;
                    }
                    // Mise à jour du nombre d'éléments restants à récupérer
                    qtePossibleNext -= elementsNext.length;
                }


                sauvegardeDataToJson(listSecondResult, index, resultatTotalNext);
            } else {
                console.log('❌ page vide ❌');
            }

            index++;
        }
    }
    console.log('\n 💤💤 Extraction terminer 💤💤')
}



module.exports = { processusParticulierCanada411 };
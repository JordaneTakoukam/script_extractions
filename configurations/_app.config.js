const { agentsUtilisateurs } = require('./agents_utilisateurs');
const { langues } = require('./langues');
const { moteurDeRecherche } = require('./moteur_de_recherche');

module.exports = {
    config: {
        mode: 'dev',
        agentsUtilisateurs: agentsUtilisateurs,
        langues: langues,
        moteurDeRecherche: moteurDeRecherche,
    }
};

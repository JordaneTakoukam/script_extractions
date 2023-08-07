const { creerLeBrowser, lancerLeBrowser } = require("../../modules_globaux/browsers");


async function particulierPagesBlanches() {
    var browserInstance = await creerLeBrowser();
    var page = lancerLeBrowser({
        browserInstance,
        url: 'https://www.pagesjaunes.fr/',
        nbreTentative: 1,
    });

}


module.exports = { particulierPagesBlanches }
const { lancerLeNavigateur, lancerLeSiteWeb } = require("../../navigateurs/navigateur");
const { processusParticulierCanada411 } = require("./modules/processus");

async function particulierCanada411() {
    const url = "https://www.canada411.ca/";
    // const url = "http://mobile.canada411.ca/search/?stype=si&what=samuel&where=Montreal";

    const selecteur = {
        input1: 'input#c411PeopleWhat',
        input2: 'input#c411PeopleWhere',
        totalResult: 'div.c411ResultsTop h1',
        resultPerPage: 'select#form-control input-sm',
        input3: 'input#c411HdrFapWhat',
        input4: 'input#c411HdrFapWhere',
    }

    const instanceNavigateur = await lancerLeNavigateur();
    if (instanceNavigateur) var page = await lancerLeSiteWeb({ browserInstance: instanceNavigateur, url: url });
    if (page) processusParticulierCanada411({ page: page, selecteur: selecteur });

}

module.exports = { particulierCanada411 }


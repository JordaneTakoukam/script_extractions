const { particulierAnnuaire118 } = require("./cibles/annuaire_118_712");
const { particulierPagesBlanches } = require("./cibles/particuliers_pages_blanches");
const { particulierCanada411 } = require("./cibles/particuliers_canada411");






// extraction particulier de annuaire 118 712
// particulierAnnuaire118();


// particulier de page blanches
// particulierPagesBlanches();



// npm install zenrows

// const { ZenRows } = require('zenrows');
// const fs = require('fs').promises;

// (async () => {
//     const client = new ZenRows('b8bb9472be584745650a31bf915554847b436fa7');
//     const url = 'https://www.pagesjaunes.fr/pagesblanches';

//     try {
//         const { data } = await client.get(url, {
//             'js_render': 'true',
//             'antibot': 'true',
//             'premium_proxy': 'true'
//         });

//         fs.writeFile('data.html', data)
//     } catch (error) {
//         console.error(error);
//     }
// })();


// puppeteer-extra is a drop-in replacement for puppeteer, 
// it augments the installed puppeteer with plugin functionality 
// const puppeteer = require('puppeteer-extra')

// // add stealth plugin and use defaults (all evasion techniques) 
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin())

// const { executablePath } = require('puppeteer')

// // puppeteer usage as normal 
// puppeteer.launch({ executablePath: executablePath() }).then(async browser => {
//     const page = await browser.newPage()
//     await page.goto('https://www.pagesjaunes.fr/pagesblanches')
//     await page.waitForTimeout(2000)
//     await page.screenshot({ path: 'cointracker_home.png', fullPage: true })
//     await browser.close()
// })


    // const puppeteer = require('puppeteer-extra')

    // // add stealth plugin and use defaults (all evasion techniques)
    // const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    // puppeteer.use(StealthPlugin())


    // // puppeteer usage as normal
    // puppeteer.launch({ headless: false }).then(async browser => {
    //     console.log('Running tests..')
    //     const page = await browser.newPage()
    //     await page.goto('https://www.pagesjaunes.fr')
    //     await page.waitForTimeout(5000)
    //     await page.screenshot({ path: 'testresult.png', fullPage: true })
    //     // await browser.close()
    //     console.log(`All done, check the screenshot. ✨`)
    // })


    particulierCanada411();
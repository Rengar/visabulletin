// GITHUB: github.com/Rengar/visabulletin

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const config = require('./config.json');

let { current_month: thisMonth, current_year: thisFY } = config;

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];

const bulletinData = [
    ['AFRICA', 'AF', 0, 0, 0, ''],
    ['ASIA', 'AS', 0, 0, 0, ''],
    ['EUROPE', 'EU', 0, 0, 0, ''],
    ['NORTH AMERICA', 'NA', 0, 0, 0, ''],
    ['OCEANIA', 'OC', 0, 0, 0, ''],
    ['SA And CARIBBEAN', 'CABA', 0, 0, 0, '']
];

let alreadySent = false;

const fetchVisaBulletin = async () => {
    const nextMonthIndex = thisMonth + 1 > 11 ? 0 : thisMonth + 1;
    const govUrl = `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${thisFY}/visa-bulletin-for-${months[thisMonth].toLowerCase()}-${thisMonth >= 9 ? thisFY - 1 : thisFY}.html`;
    
    console.log(govUrl);

    try {
        const response = await axios.get(govUrl);
        console.log(`Checking for visa bulletin - ${govUrl}`);

        const $ = cheerio.load(response.data);
        const willApply = `WILL APPLY IN ${months[nextMonthIndex].toUpperCase()}`;
        const pageText = $('body').text();

        if (!pageText.includes(willApply)) {
            return console.log(`The new visa bulletin was found, but the string "${willApply}" was not found on the page.`);
        }

        const oldYear = $('.tsg-rwd-main-copy-frame .tsg-rwd-content-page-parsysxxx table:nth-of-type(2) tr');
        const newYear = $('.tsg-rwd-main-copy-frame .tsg-rwd-content-page-parsysxxx table:nth-of-type(3) tr');

        [oldYear, newYear].forEach((yearData, yearIndex) => {
            for (let i = 1; i < yearData.length; i++) {
                bulletinData[i - 1][yearIndex === 0 ? 3 : 4] = $(yearData[i]).find('td:nth-of-type(2)').text().replace(/,/g, '');
                if (yearIndex === 1) {
                    bulletinData[i - 1][5] = $(yearData[i]).find('td:nth-of-type(3)').text().replace(/except: ? ?/igm, '').replace(/^\s+|\s+$/gm, '').toUpperCase();
                }
            }
        });

        let bulletinTextEng = `📊 ${months[thisMonth]} Visa Bulletin came out. FY${thisFY.toString().slice(2)} 📊\n\nRegion | Cut-off:\n`;
        bulletinData.forEach(row => {
            bulletinTextEng += `${row[0]}: ${row[3].toUpperCase()}\n`;
        });

        if (thisMonth === 8) {
            bulletinTextEng += `\n📍 ${months[nextMonthIndex]} Visa Bulletin. FY${(thisFY + 1).toString().slice(2)} 📍\n\nRegion | Cut-off\n`;
        } else {
            bulletinTextEng += `\n✂️ ${months[nextMonthIndex]} Cut-Off ✂️\n\nRegion | Cut-off ( Difference )\n`;
        }

        bulletinData.forEach(row => {
            const difText = isNaN(row[4]) || isNaN(row[3]) || thisMonth === 8 ? '' : ` ( ${row[4] - row[3]} )`;
            bulletinTextEng += `${row[0]}: ${row[4].toUpperCase()} ${difText}\n`;
        });

        bulletinTextEng += '\n⭕️ Excepts ⭕️\n';
        const totalExcepts = bulletinData.reduce((acc, row) => {
            if (row[5].length > 3) {
                bulletinTextEng += `\n${row[0]}:\n${row[5]}\n`;
                acc++;
            }
            return acc;
        }, 0);

        if (totalExcepts === 0) {
            bulletinTextEng += '\nNo exceptions';
        }

        if (alreadySent !== thisMonth) {
            await Promise.all(config.telegram_chat_ids.map(chat_id => {
                return axios.post(`https://api.telegram.org/bot${config.telegram_bot_key}/sendMessage`, {
                    chat_id,
                    text: bulletinTextEng
                });
            }));

            alreadySent = thisMonth;
            console.log(`Visa Bulletin For ${months[thisMonth]} Sent`);
        }

        thisMonth = (thisMonth + 1) % 12;
        if (thisMonth === 9) thisFY++;

        config.current_month = thisMonth;
        config.current_year = thisFY;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    } catch (error) {
        console.error(`Error fetching visa bulletin: ${error.message}`);
    }
};

setInterval(fetchVisaBulletin, 60000 * 2);
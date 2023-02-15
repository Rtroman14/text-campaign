const moment = require("moment");

const Airtable = require("./src/Airtable");
const _ = require("./src/Helpers");

const {
    // NUM_CONTACTS,
    NUM_REONOMY,
    NUM_FACILITIES,
    SLACK_NOTIFICATION,
    KEEP_ACCOUNTS,
    REMOVE_ACCOUNTS,
    removeAccounts,
    keepAccounts,
} = require("./config");

const today = moment(new Date()).format("MM/DD/YYYY");

const MAX_NUM_TEXTS = Math.max(NUM_REONOMY, NUM_FACILITIES);

(async () => {
    try {
        const getCampaigns = await Airtable.getCampaigns();
        let accounts = _.accountsToRun(getCampaigns);

        if (REMOVE_ACCOUNTS) {
            accounts = removeAccounts(accounts);
        }

        if (KEEP_ACCOUNTS) {
            accounts = keepAccounts(accounts);
        }

        if (NUM_REONOMY === 0) {
            // remove reonomy accounts from list
            accounts = _.removeReonomyAccounts(accounts);
        }
        if (NUM_FACILITIES === 0) {
            // remove reonomy accounts from list
            accounts = _.removeFacilityAccounts(accounts);
        }

        console.log(accounts);
    } catch (error) {
        console.log(error);
    }
})();

const moment = require("moment");

const textOutreach = require("./src/textOutreach");
const Airtable = require("./src/Airtable");
const slackNotification = require("./src/slackNotification");
const _ = require("./src/Helpers");

const {
    NUM_REONOMY,
    NUM_FACILITIES,
    SLACK_NOTIFICATION,
    KEEP_ACCOUNTS,
    REMOVE_ACCOUNTS,
    removeAccounts,
    keepAccounts,
} = require("./config");

const today = moment(new Date()).format("MM/DD/YYYY");

const MAX_NUM_TEXTS = Math.max(NUM_FACILITIES, NUM_REONOMY);

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
            accounts = _.removeReonomyAccounts(accounts);
        }
        if (NUM_FACILITIES === 0) {
            accounts = _.removeFacilityAccounts(accounts);
        }

        SLACK_NOTIFICATION && (await slackNotification("Launching texts..."));

        for (let numText = 1; numText <= MAX_NUM_TEXTS; numText++) {
            const arrayTextOutreach = accounts.map((account) => textOutreach(account));

            const results = await Promise.all(arrayTextOutreach);

            // * check to see if client texted same prospect twice
            const textedProspects = results
                .filter((res) => res?.status === "Live")
                .map((res) => `${res.Client} - ${res.texted}`);

            const textedSameProspect = _.hasDuplicates(textedProspects);
            if (textedSameProspect) {
                await slackNotification("TEXTED SAME PROSPECT MULTIPLE TIMES!!");
                throw new Error("\nTEXTED SAME PROSPECT!!");
            }

            for (let result of results) {
                if (result?.status === "Need More Contacts") {
                    if (numText > 2) {
                        await Airtable.updateCampaign(result.recordID, {
                            "Campaign Status": result.status,
                            "Last Updated": today,
                        });
                    } else {
                        await Airtable.updateCampaign(result.recordID, {
                            "Campaign Status": result.status,
                        });
                    }

                    // remove account from list
                    accounts = accounts.filter(
                        (currentAccount) => currentAccount.Account !== result.Account
                    );
                }
            }

            console.log(`\n --- Texts sent: ${numText} / ${String(MAX_NUM_TEXTS)} --- \n`);

            if (numText === NUM_REONOMY) {
                const reonomyAccounts = _.removeFacilityAccounts(accounts);
                for (let reonomyAccount of reonomyAccounts) {
                    await Airtable.updateCampaign(reonomyAccount.recordID, {
                        "Campaign Status": "Live",
                        "Last Updated": today,
                    });
                }
                accounts = _.removeReonomyAccounts(accounts);
            }
            if (numText === NUM_FACILITIES) {
                const facilityAccounts = _.removeReonomyAccounts(accounts);
                for (let facilityAccount of facilityAccounts) {
                    await Airtable.updateCampaign(facilityAccount.recordID, {
                        "Campaign Status": "Live",
                        "Last Updated": today,
                    });
                }
                accounts = _.removeFacilityAccounts(accounts);
            }

            MAX_NUM_TEXTS !== numText && (await _.minutesWait(1.5));
        }

        return;
    } catch (error) {
        console.log(error);

        await slackNotification("There was an error with texts: \n", error.message);

        process.exit(1); // Retry Job Task by exiting the process
    }
})();

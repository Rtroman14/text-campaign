module.exports = {
    NUM_REONOMY: 30,
    NUM_FACILITIES: 10,
    SLACK_NOTIFICATION: true,
    REMOVE_ACCOUNTS: false,
    removeAccounts: (accounts) =>
        accounts.filter(
            (acc) =>
                acc.Client !== "SIRC" &&
                acc.Client !== "Built Right Roofing" &&
                acc.Client !== "HD Roofing" &&
                acc.Client !== "All Elements" &&
                acc.Client !== "Dr. Roof" &&
                acc.Client !== "Greentek" &&
                acc.Client !== "Integrity Pro Roofing" &&
                acc.Client !== "Pinnacle Roofing Group" &&
                acc.Client !== "SCS Construction" &&
                acc.Client !== "Stone Roofing" &&
                acc.Account !== "Farha Roofing - Lamar" &&
                acc.Client !== "Level Edge Construction"
        ),
    KEEP_ACCOUNTS: false,
    keepAccounts: (accounts) =>
        (accounts = accounts.filter(
            (acc) =>
                // acc.Account === "J&M Roofing - Facilities" ||
                // acc.Account === "Waddle Exteriors - Facilities" ||
                // acc.Account === "HD Roofing - Facilities" ||
                acc.Account === "Mitchell and Sons Roofing"
        )),
};

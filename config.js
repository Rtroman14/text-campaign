module.exports = {
    NUM_REONOMY: 30,
    NUM_FACILITIES: 10,
    SLACK_NOTIFICATION: true,
    REMOVE_ACCOUNTS: false,
    removeAccounts: (accounts) =>
        accounts.filter(
            (acc) =>
                acc.Client !== "SIRC" &&
                acc.Client !== "HD Roofing" &&
                acc.Client !== "Level Edge Construction"
        ),
    KEEP_ACCOUNTS: false,
    keepAccounts: (accounts) =>
        (accounts = accounts.filter(
            (acc) =>
                // acc.Account === "Arcus Roof - Facilities" ||
                // acc.Account === "A Best Roofing - Facilities" ||
                // acc.Account === "Howard Construction - Facilities" ||
                // acc.Account === "Precision Roofing - Facilities" ||
                // acc.Account === "Yoder's Roofing Service - Facilities" ||
                // acc.Account === "Executive Roofing - Facilities" ||
                // acc.Account === "Paramount Commercial Roofing Systems - Facilities" ||
                // acc.Account === "Stone Roofing - Facilities" ||
                acc.Account === "Premier Claims - Iowa"
        )),
};

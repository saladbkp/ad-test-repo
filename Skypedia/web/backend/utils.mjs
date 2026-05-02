import pool from "./db.mjs";

function getGroupName(username) {
    const match = username.match(/^([A-Z]{3,10})_/);
    return match ? match[1] : null;
}


function isInGroup(username, groupName) {
    return username.indexOf(`${groupName}_`) === 0;
}


export { getGroupName, isInGroup };
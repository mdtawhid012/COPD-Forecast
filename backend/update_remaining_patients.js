const fs = require('fs');
const oldData = require('./data/patients.js');

const toRemove = ['301', '302', '303', '305', '306', '309', '311', '314', '317', '319', '320', '323', '328'];
const remaining = Object.values(oldData).filter(p => !toRemove.includes(p.id));

let newDataStr = 'const syntheaData = {\n\n';
let currentId = 301;

newDataStr += '/* ---------------- LOW RISK ---------------- */\n\n';

remaining.forEach(p => {
    
    // Group them roughly by risk (since I can see the data structure, I'll put some dividers)
    if (currentId === 306) {
        newDataStr += '\n/* ---------------- MODERATE RISK ---------------- */\n\n';
    } else if (currentId === 312) {
        newDataStr += '\n/* ---------------- HIGH RISK ---------------- */\n\n';
    }

    p.id = String(currentId);
    let line = `"${currentId}": { id:"${currentId}", AGE:${p.AGE}, smoking:${p.smoking}, gender:${p.gender}, Diabetes:${p.Diabetes}, hypertension:${p.hypertension}, AtrialFib:${p.AtrialFib}, IHD:${p.IHD}, PackHistory:${p.PackHistory}, CAT:${p.CAT}, SGRQ:${p.SGRQ}, FEV1:${p.FEV1}, FEV1PRED:${p.FEV1PRED}, FVC:${p.FVC}, HAD:${p.HAD}, muscular:${p.muscular}, summary:"${p.summary}" },\n`;
    newDataStr += line;
    currentId++;
});

newDataStr += '\n};\n\nmodule.exports = syntheaData;';

fs.writeFileSync('./data/patients.js', newDataStr);
console.log('Successfully reindexed ' + remaining.length + ' patients. New max ID is ' + (currentId - 1));

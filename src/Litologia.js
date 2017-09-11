import livDueGerarchia from './liv_due_gerarchia.json';

let DATA_NORMALIZZATA = livDueGerarchia.data;

function getParentsOfVaules(state, tabKey, values) {
    const table = state[tabKey];
    if (!table) {
        throw "errore tabella non esiste: " + tabKey;
    }

    const selectedFromTable = values.map(value => {
        let {dentro} = table[value];
        return {tableKey: tabKey, value, dentro};
    });

    function riduciFun(acc, v) {
        let key = v.dentro;
        let presente = acc[key];

        if (presente) {
            presente.push(v);
            acc[key] = presente;
        } else {
            acc[key] = [v];
        }
        return acc;
    }
    const riassunto = selectedFromTable.reduce(riduciFun, {});

    function selezionaCampi(obj, soloId = true) {
        let newObj = {};
        Object
            .keys(obj)
            .map(key => {
                let lista = obj[key];
                let soloCampiSelezionati = lista.map(v => {
                    let {tableKey, value} = v;
                    if (soloId) {
                        return [tableKey, value]; // Id
                    }
                    return {tableKey, value};    // object
                });

                newObj[key] = soloCampiSelezionati;
            });

        return newObj;
    }

    let soloId = true;
    return selezionaCampi(riassunto, soloId);
}

function selezionaLegendaDaCartografati(dataNormalizzata, listaCartografati) {
    let liv2 = getParentsOfVaules(dataNormalizzata, "liv2", listaCartografati);
    let liv1 = getParentsOfVaules(dataNormalizzata, "liv1", Object.keys(liv2));
    let liv0 = getParentsOfVaules(dataNormalizzata, "liv0", Object.keys(liv1));

    return {liv0, liv1, liv2};
}

function getFromDataNorm(data, ident) {
    let [tabella, key] = ident;
    let valore = data[tabella] && data[tabella][key];
    return valore;
}

function createFlatten(dataNorm, legenda) {
    let root = [];
    let iDsLiv0 = legenda.liv0.root;
    iDsLiv0.forEach(ident => {
        let [tag0, id0] = ident;
        let value0 = getFromDataNorm(dataNorm, ident);
        root.push({tag: tag0, value: value0});
        let iDsLiv1 = legenda.liv1[id0];
        iDsLiv1.forEach(ident1 => {
            let [tag1, id1] = ident1;
            let value1 = getFromDataNorm(dataNorm, ident1);
            root.push({tag: tag1, value: value1});
            let iDsLiv2 = legenda.liv2[id1]; // value = A1, A2, B1 Fkey liv2 - iDs liv1
            iDsLiv2.forEach(ident2 => {      // value = A1.1, A1.2 - iDs liv2
                let tag2 = ident2[0];
                let value2 = getFromDataNorm(dataNorm, ident);
                root.push({tag: tag2, value: value2});
            });
        });
    });

    return root;
}

function createTree(dataNorm, legenda) {
    let root = [];
    let iDsLiv0 = legenda.liv0.root;
    iDsLiv0.forEach(ident0 => {
        let value0 = getFromDataNorm(dataNorm, ident0);
        let new0 = {
            tag: "liv0",
            value: value0,
            children: []
        };
        let id0 = ident0[1];
        let iDsLiv1 = legenda.liv1[id0];
        iDsLiv1.forEach(ident1 => {
            let value1 = getFromDataNorm(dataNorm, ident1);
            let new1 = {
                tag: "liv1",
                value: value1,
                children: []
            };
            new0
                .children
                .push(new1);
            let id1 = ident1[1];
            let iDsLiv2 = legenda.liv2[id1]; // value = A1, A2, B1 Fkey liv2 - iDs liv1
            iDsLiv2.forEach(ident2 => { // value = A1.1, A1.2 - iDs liv2
                let value2 = getFromDataNorm(dataNorm, ident2);
                let new2 = {
                    tag: "liv2",
                    value: value2
                };
                new1
                    .children
                    .push(new2);
            });
        });
        root.push(new0);
    });
    return root;
}

function compareArrayOfString(a, b) {
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
}

export function getTreeGerarchia(codiciTrovati) {
    if (codiciTrovati === []) {
        return {liv0: {root: []}};
    }
    codiciTrovati.sort(compareArrayOfString);
    let legCartografato = selezionaLegendaDaCartografati(DATA_NORMALIZZATA, codiciTrovati);
    return createTree(DATA_NORMALIZZATA, legCartografato);
}

export function getFlattenGerarchia(codiciTrovati) {
    if (codiciTrovati === []) {
        return {liv0: {root: []}};
    }
    codiciTrovati.sort(compareArrayOfString);
    let legCartografato = selezionaLegendaDaCartografati(DATA_NORMALIZZATA, codiciTrovati);
    return createFlatten(DATA_NORMALIZZATA, legCartografato);
}


function parseExcelFile(file, process) {
    var reader = new FileReader();



    reader.onload = function(e) {
        var data = e.target.result;

        var workbook = XLSX.read(data, {
            type: 'binary',
            cellStyles: true
        });
        workbook.SheetNames.forEach(function(sheetName) {
            var sheet = workbook.Sheets[sheetName];
            console.log(sheet);
            process(sheet);
        })
    };

    reader.onerror = function(ex) {
        console.log(ex);
    };

    reader.readAsBinaryString(file);
}
const Letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function parse(file, ListTeachers, oncall){parseExcelFile(file, (sheet) => {
    let igroneCols = [];
    for (let i = 0; i < Letters.length; i++) {
        if (sheet["!cols"][i].hidden) igroneCols.push(i);
    }
    function cell(x, y){
        for (let i = 0; i <= x; i++) {
            if (igroneCols.includes(i)) x++;
        }
        let name = `${Letters[x]}${y+1}`;
        if (sheet[name] && sheet[name].w) return sheet[name].w;
        return "";
    }
    let startY = 0;
    while (!cell(0, startY).toLowerCase().includes("дни")){
        startY++;
    }
    let grp_hors = [];
    for (let i = 0; i < Letters.length; i++) {
        if (cell(i, startY).toLowerCase().includes("группа")){ grp_hors.push(i); }
    }
    let grp_pairs = [];
    for (let i = 0; i < 256-startY; i++) {
        if (/^\d+$/.test(cell(1, startY+i))) grp_pairs.push(startY+i);
    }
    let groupsDays = [];
    for (let i = 0; i < grp_hors.length; i++) {
        let x = grp_hors[i];
        let grp = {name: cell(x, startY), data: []};
        let day = [];
        let emptyList = 0;
        for (let j = 0; j < grp_pairs.length; j++) {
            let y = grp_pairs[j];
            if (cell(1, y) === "1" && j !== 0){
                while (emptyList > 0) {day.pop(); emptyList--;}
                for (let j = 0; j < day.length; j++) if (day[j].pair.length < 3) day[j] = null;
                grp.data.push(day);
                day = [];
            }
            let p = cell(x, y);
            let t = cell(x+1, y).toLowerCase();
            let c = cell(x+2, y);

            let teacher = -1;
            try {
                let char = "";
                if (t.includes("\n")) char = "\n";
                if (t.includes("   ")) char = "   ";
                if (char.length > 0) {
                    teacher = [-1, -1];
                    var parts = t.replaceAll(".", "").replaceAll("\r", "").split(char);
                    var t1 = parts[0].replaceAll("1", "").replaceAll(" ", "");
                    var t2 = parts[1].replaceAll("2", "").replaceAll(" ", "");
                    for (var key in ListTeachers) {
                        if (ListTeachers[key].replaceAll(" ", "").toLowerCase() === t1) {
                            teacher[0] = key;
                        }
                        if (ListTeachers[key].replaceAll(" ", "").toLowerCase() === t2) {
                            teacher[1] = key;
                        }
                    }
                } else {
                    for (var key in ListTeachers) {
                        if (ListTeachers[key].replaceAll(" ", "").toLowerCase() === t.replaceAll(" ", "")) {
                            teacher = key;
                        }
                    }
                }
            }
            catch (_) { console.log(_)}

            p.replace("   ", "\n");
            while (p.includes("  ")) p = p.replaceAll("  ", " ");


            day.push({pair: p, teacher: teacher, cabinet: c});
            if (
                p.replaceAll(" ", "") === "" &&
                t.replaceAll(" ", "") === "" &&
                c.replaceAll(" ", "") === ""
            ) emptyList++;
            else emptyList = 0;
        }
        while (emptyList > 0) {day.pop(); emptyList--;}
        for (let j = 0; j < day.length; j++) if (day[j].pair.length < 3) day[j] = null;
        grp.data.push(day);
        groupsDays.push(grp);
    }
    console.log(groupsDays);
    oncall(groupsDays);
})}
export {
    parse
}
// Script to monitor
const { exec } = require("child_process");
const fs = require("fs");
const csvWriter = require('csv-write-stream')
const PROGRAMS = [
	"chrome"
]

const WAIT = 750 // wait between mesaures in milli seconds

/**
 * Measure function
 * @param {String} program Program name to be inputed
 * @param {Number} interval interval beatween measures in milliseconds
 */
function measure(program, interval) {
    const csv = csvWriter();
    csv.pipe(fs.createWriteStream(`results-${program}.csv`))
    setInterval(() => {
        exec(`powershell -command "(Get-Process ${program} | Measure-Object WorkingSet -sum).sum"`, {
            //shell: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        }, (err, stdout, stderr) => {
            if (err) {
		console.log(stderr);
                throw err
            } else if (stderr) {
                console.log(stderr);
            }
            // Add to Spreadsheet
            const writeOBJ = {}
            const std0 = stdout.split("\n")[0];
            writeOBJ[program] = parseInt(std0) / 1000 / 1000; // In MB
            csv.write(writeOBJ);
            console.log(`${program}: ${std0}`)
        })
    }, interval);
}

PROGRAMS.forEach(function(program) {
    measure(program, WAIT);
}, this);
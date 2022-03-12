const fs = require("fs")
const path = require("path")

const inPath = "scar"
const outPath = "C:\\Users\\xtrem\\Documents\\toratest\\assets\\scar"

const inFile = path.join(inPath, "main.lua")

const inFileText = fs.readFileSync(inFile, "utf-8")
const outFileText = inFileText.replaceAll("importScar", "import")

const outFile = path.join(outPath, "toratest.scar")
console.log(inFile, "->", outFile)

fs.writeFileSync(outFile, outFileText)
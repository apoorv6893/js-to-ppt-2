const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

async function run() {

    const inputFile = process.argv[2];
    const outputFile = process.argv[3];

    if (!inputFile || !outputFile) {
        throw new Error(
            "Usage: node generator.js <input.js> <output.pptx>"
        );
    }

    let code = fs.readFileSync(inputFile, "utf8");

    // -------------------------------------------------------
    // Remove CommonJS import
    // -------------------------------------------------------

    code = code.replace(
        /(?:const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]pptxgenjs['"]\s*\)\s*;?/gi,
        ""
    );

    // -------------------------------------------------------
    // Remove ES Module import
    // -------------------------------------------------------

    code = code.replace(
        /import\s+.*?\s+from\s+['"]pptxgenjs['"]\s*;?/gi,
        ""
    );

    // -------------------------------------------------------
    // Detect presentation variable
    // -------------------------------------------------------

    const creationRegex =
        /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*new\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\(\s*\)\s*;?/;

    const match = code.match(creationRegex);

    let presentationVariable = "pres";

    if (match) {

        presentationVariable = match[1];

        code = code.replace(
            creationRegex,
            `const ${presentationVariable} = pptx;`
        );
    }

    // -------------------------------------------------------
    // Remove any writeFile(...)
    // -------------------------------------------------------

    const writeRegex =
        new RegExp(
            `${presentationVariable}\\.writeFile\\([\\s\\S]*?\\);?`,
            "g"
        );

    code = code.replace(writeRegex, "");

    // -------------------------------------------------------
    // Execute
    // -------------------------------------------------------

    const wrapped = `
const pptx = new PptxGenJS();

${code}

await pptx.writeFile({
    fileName: ${JSON.stringify(outputFile)}
});
`;

    const AsyncFunction =
        Object.getPrototypeOf(async function () {}).constructor;

    const fn =
        new AsyncFunction(
            "PptxGenJS",
            wrapped
        );

    await fn(PptxGenJS);

}

run()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

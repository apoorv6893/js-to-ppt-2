const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

async function run() {
    const inputFile = process.argv[2];
    const outputFile = process.argv[3];

    if (!inputFile || !outputFile) {
        throw new Error("Usage: node generator.js <input.js> <output.pptx>");
    }

    let code = fs.readFileSync(inputFile, "utf8");

    // Remove standalone bootstrap
    code = code.replace(
        /const\s+pptxgen\s*=\s*require\s*\(\s*['"]pptxgenjs['"]\s*\)\s*;?/g,
        ""
    );

    code = code.replace(
        /const\s+pres\s*=\s*new\s+pptxgen\s*\(\s*\)\s*;?/g,
        "const pres = pptx;"
    );

    code = code.replace(
        /pres\.writeFile\s*\([\s\S]*$/m,
        ""
    );

    const wrappedCode = `
const pptx = new PptxGenJS();

${code}

await pptx.writeFile({
    fileName: ${JSON.stringify(outputFile)}
});
`;

    const AsyncFunction =
        Object.getPrototypeOf(async function () {}).constructor;

    const fn = new AsyncFunction(
        "PptxGenJS",
        wrappedCode
    );

    await fn(PptxGenJS);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});

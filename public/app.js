const form = document.getElementById("uploadForm");
const statusDiv = document.getElementById("status");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusDiv.textContent = "Generating PowerPoint...";

    const uploadedFile = document.getElementById("script").files[0];
    const pastedCode = document.getElementById("code").value.trim();
    const filename = document.getElementById("filename").value.trim() || "presentation";

    let file;

    if (pastedCode.length > 0) {
        file = new File(
            [pastedCode],
            "script.js",
            {
                type: "application/javascript"
            }
        );
    } else if (uploadedFile) {
        file = uploadedFile;
    } else {
        statusDiv.textContent =
            "Please either upload a JavaScript file or paste JavaScript code.";
        return;
    }

    const data = new FormData();

    data.append("script", file);
    data.append("filename", filename);

    try {

        const response = await fetch("/generate", {
            method: "POST",
            body: data
        });

        if (!response.ok) {

            let errorMessage = "PowerPoint generation failed.";

            try {
                const err = await response.json();
                errorMessage = err.error || errorMessage;
            } catch (_) {}

            statusDiv.textContent = errorMessage;
            return;
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `${filename}.pptx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        statusDiv.textContent = "PowerPoint generated successfully.";

    } catch (err) {

        statusDiv.textContent =
            "Unexpected error:\n\n" + err.message;

    }

});

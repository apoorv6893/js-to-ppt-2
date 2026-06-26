const form = document.getElementById("uploadForm");
const statusDiv = document.getElementById("status");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    statusDiv.innerHTML = "Generating PowerPoint...";

    const file = document.getElementById("script").files[0];

    if (!file) {
        statusDiv.innerHTML = "Please choose a JavaScript file.";
        return;
    }

    const data = new FormData();

    data.append("script", file);

    const response = await fetch("/generate", {
        method: "POST",
        body: data
    });

    if (!response.ok) {

        const err = await response.json();

        statusDiv.innerHTML = err.error;

        return;
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "presentation.pptx";

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

    statusDiv.innerHTML = "PowerPoint generated successfully.";
});

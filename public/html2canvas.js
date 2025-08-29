document.getElementById("download").addEventListener("click", () => {
    const element = document.getElementById("poster");
    const title = document.querySelector("form#title input").value;

    function formatDate(date) {
        const d = date.getDate();
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const h = date.getHours();
        const min = date.getMinutes();

        return `${d}${m}${y}${h}${min.toString().padStart(2, '0')}`;
    }
    const now = new Date();

    html2canvas(element, {
        backgroundColor: null,
        useCORS: true
    }).then(canvas => {
        const dataUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${title}_${formatDate(now)}`;
        link.click();
    });
});

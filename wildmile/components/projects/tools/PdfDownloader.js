"use client";

export default function PdfDownloader() {
  const downloadPDF = () => {
    fetch("/api/projects/pdf")
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "generated-server.pdf");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => console.error("Error downloading the PDF:", error));
  };

  return (
    <div>
      <button onClick={downloadPDF}>Download PDF</button>
    </div>
  );
}

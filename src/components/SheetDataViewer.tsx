import { useEffect, useState } from "react";

function SheetDataViewer() {
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/sheet-data")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sheet data");
        return res.json();
      })
      .then((data) => {
        setSheetData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading sheet data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Google Sheet Data</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {sheetData.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ border: "1px solid #ccc", padding: 4 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SheetDataViewer; 
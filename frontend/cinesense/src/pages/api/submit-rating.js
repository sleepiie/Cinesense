export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("Received rating:", req.body); // ข้อมูลจาก frontend
    // TODO: เก็บลง database หรือ process ต่อ
    res.status(200).json({ status: "ok" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

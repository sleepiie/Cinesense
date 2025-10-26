export default function handler(req, res) {
  if (req.method === "POST") {
    // TODO: เก็บลง database หรือ process ต่อ
    res.status(200).json({ status: "ok" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

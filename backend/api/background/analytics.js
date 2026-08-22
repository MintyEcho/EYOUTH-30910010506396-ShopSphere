// Background analytics logger - runs outside the main Express app
// Logs page views and user activity for business intelligence

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { page, userId, timestamp } = req.body;

  // In production, this would write to a data warehouse or analytics DB
  // For now, we log it server-side (Vercel captures this in function logs)
  console.log(JSON.stringify({
    event: "page_view",
    page,
    userId: userId || "anonymous",
    timestamp: timestamp || new Date().toISOString(),
    service: "analytics-serverless"
  }));

  res.status(200).json({ success: true, message: "Analytics logged" });
};
const prisma = require("../config/prisma");
const ActivityLog = require("../models/ActivityLog");

async function getReviewCount() {
  try {
    const res = await fetch(`${process.env.REVIEW_SERVICE_URL}/api/reviews/count`);
    if (!res.ok) throw new Error("Failed to fetch review count");
    const data = await res.json();
    return data.count;
  } catch (err) {
    console.error("Review service unreachable:", err.message);
    return 0; // fallback so stats still work
  }
}

exports.getSummary = async (req, res) => {
  const [userCount, productCount, orderCount, categoryCount, reviewCount, recentActivity] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      getReviewCount(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

  res.json({
    users: userCount,
    products: productCount,
    orders: orderCount,
    categories: categoryCount,
    reviews: reviewCount,
    recentActivity,
  });
};
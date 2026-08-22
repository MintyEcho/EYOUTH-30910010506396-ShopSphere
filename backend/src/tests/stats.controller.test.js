const statsController = require("../controllers/statsController");
const prisma = require("../config/prisma");
const ActivityLog = require("../models/ActivityLog");

jest.mock("../config/prisma", () => ({
  user: { count: jest.fn() },
  product: { count: jest.fn() },
  order: { count: jest.fn() },
  category: { count: jest.fn() },
}));

jest.mock("../models/ActivityLog", () => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn(),
}));

global.fetch = jest.fn();

describe("Stats Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getSummary() should aggregate statistics cleanly across separate databases", async () => {
    const req = {};
    const res = { json: jest.fn() };

    prisma.user.count.mockResolvedValue(10);
    prisma.product.count.mockResolvedValue(50);
    prisma.order.count.mockResolvedValue(5);
    prisma.category.count.mockResolvedValue(4);
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 100 }),
    });
    
    ActivityLog.find.mockReturnThis();
    ActivityLog.sort.mockReturnThis();
    ActivityLog.limit.mockResolvedValue([{ action: "test" }]);

    await statsController.getSummary(req, res);

    expect(res.json).toHaveBeenCalledWith({
      users: 10,
      products: 50,
      orders: 5,
      categories: 4,
      reviews: 100,
      recentActivity: [{ action: "test" }],
    });
  });
});
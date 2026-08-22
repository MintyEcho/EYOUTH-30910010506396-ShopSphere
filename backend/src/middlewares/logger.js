// Structured logger for Task 4.2
const structuredLog = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const log = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? "error" : "info",
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
    };
    console.log(JSON.stringify(log));
  });
  next();
};

const errorLog = (err, req, res, next) => {
  const log = {
    timestamp: new Date().toISOString(),
    level: "error",
    message: err.message,
    stack: err.stack,
  };
  console.error(JSON.stringify(log));
  next(err);
};

module.exports = { structuredLog, errorLog };
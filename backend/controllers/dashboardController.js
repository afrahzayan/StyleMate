const { getDashboardSummary } = require("../services/dashboardService");


const getSummary = async (req, res) => {
  try {
    const summary = await getDashboardSummary(req.userId, {
      recentLimit: req.query.recentLimit,
    });

    return res.status(200).json({ dashboard: summary });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong while loading the dashboard" });
  }
};

module.exports = { getSummary };
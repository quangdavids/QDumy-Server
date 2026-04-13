const Revenue = require("../model/revenueSchema");
const DailyLecturerRevenueSchema = require("../model/dailyLecturerRevenueSchema");
const { default: mongoose } = require("mongoose");
const getDailyRevenue = async (req, res) => {
  try {
    const dailyRevenue = await Revenue.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$revenue" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res
      .status(200)
      .json({ message: "Fetch revenue data", dailyRevenue: dailyRevenue });
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch dauly revenue data",
      err: err.message,
    });
  }
};

const getDailyRevenueByLecturer = async (req, res) => {
  const { lecturerId } = req.params;

  try {
    const dailyRevenueByLecturer = await DailyLecturerRevenueSchema.aggregate([
      {
        $match: {
          lecturerId:new mongoose.Types.ObjectId(lecturerId),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$revenue" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      { $limit: 10}
    ]);

      res
      .status(200)
      .json({ message: "Fetch revenue data successfully", dailyRevenue: dailyRevenueByLecturer });

  } catch (err) {
     res.status(500).json({
      message: "Unable to fetch dauly revenue data",
      err: err.message,
  }
)
}
};

const getTotalRevenue = async (req, res) => {
  try {
    const totalRevenue = await Revenue.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$revenue" },
        },
      },
    ]);

    res
      .status(200)
      .json({
        message: "Fetch revenue data",
        totalRevenue: totalRevenue[0].totalRevenue,
      });
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch total revenue data",
      err: err.message,
    });
  }
};
module.exports = {
  getDailyRevenue,
  getTotalRevenue,
  getDailyRevenueByLecturer,
};

import Car from "../models/car.js";
import Payment from "../models/payment.js";

export const getRecommendations = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const preferences = req.user.preferences || {};

    const query = {};

    if (preferences.makes?.length) {
      query.make = { $in: preferences.makes };
    }
    if (preferences.priceRange) {
      query.price = {
        $gte: preferences.priceRange.min || 0,
        $lte: preferences.priceRange.max || 1000000,
      };
    }
    if (preferences.locations?.length) {
      query.location = { $in: preferences.locations };
    }
    if (preferences.maxMileage) {
      query.mileage = { $lte: preferences.maxMileage };
    }

    const purchasedCars = await Payment.find({
      user: userId,
      status: "completed",
    })
      .populate("car")
      .lean();
    const purchasedMakes = [
      ...new Set(purchasedCars.map((p) => p.car?.make).filter(Boolean)),
    ];

    if (purchasedMakes.length && !preferences.makes?.length) {
      query.make = { $in: purchasedMakes };
    }

    let recommendedCars = await Car.find(query)
      .select("make model year price mileage location images description")
      .limit(10)
      .lean();

    if (!recommendedCars.length) {
      recommendedCars = await Car.find()
        .sort({ createdAt: -1 }) // Recent cars
        .limit(10)
        .select("make model year price mileage location images description")
        .lean();
    }

    recommendedCars = recommendedCars
      .map((car) => {
        let score = 0;
        if (preferences.makes?.includes(car.make)) score += 2;
        if (preferences.locations?.includes(car.location)) score += 1;
        if (car.price <= preferences.priceRange?.max) score += 1;
        return { ...car, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({
      message: "Recommended cars",
      cars: recommendedCars,
    });
  } catch (err) {
    console.error("Recommendation error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch recommendations", error: err.message });
  }
};

import Car from "../models/car.js";

export const getCars = async (req, res, next) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      minMileage,
      maxMileage,
      sortBy = "createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);

    const match = {};
    if (search) {
      match.$text = { $search: search };
    }
    if (minPrice) match.price = { ...match.price, $gte: Number(minPrice) };
    if (maxPrice) match.price = { ...match.price, $lte: Number(maxPrice) };
    if (minYear) match.year = { ...match.year, $gte: Number(minYear) };
    if (maxYear) match.year = { ...match.year, $lte: Number(maxYear) };
    if (minMileage)
      match.mileage = { ...match.mileage, $gte: Number(minMileage) };
    if (maxMileage)
      match.mileage = { ...match.mileage, $lte: Number(maxMileage) };

    const sort = {};
    if (sortBy) {
      const [field, dir = "asc"] = sortBy.split(":");
      sort[field] = dir === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const aggregate = [
      { $match: match },
      { $sort: sort },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      { $project: { "seller.password": 0 } },
    ];

    const cars = await Car.aggregate(aggregate);

    const statsAggregate = [
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ];
    const [stats] = await Car.aggregate(statsAggregate);

    const total = stats?.total || 0;
    res.json({
      cars,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats: {
        avgPrice: stats?.avgPrice || 0,
        minPrice: stats?.minPrice || 0,
        maxPrice: stats?.maxPrice || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "seller",
      "name email role"
    );
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    next(error);
  }
};

export const createCar = async (req, res, next) => {
  try {
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only sellers or admins can create cars" });
    }

    const { make, model, year, price, mileage, description, location } =
      req.body;
    if (!make || !model || !year || !price || !mileage) {
      return res
        .status(400)
        .json({
          message: "make, model, year, price, and mileage are required",
        });
    }

    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: "Invalid year" });
    }
    if (isNaN(price) || price < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }
    if (isNaN(mileage) || mileage < 0) {
      return res
        .status(400)
        .json({ message: "Mileage must be a positive number" });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];
    const car = new Car({
      make,
      model,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      description,
      location,
      images,
      seller: req.user.id,
    });

    await car.save();
    const populated = await Car.findById(car._id).populate(
      "seller",
      "name email role"
    );
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only the seller or admin can update this car" });
    }

    const { make, model, year, price, mileage, description, location } =
      req.body;

    if (year !== undefined) {
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        return res.status(400).json({ message: "Invalid year" });
      }
      car.year = Number(year);
    }
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return res
          .status(400)
          .json({ message: "Price must be a positive number" });
      }
      car.price = Number(price);
    }
    if (mileage !== undefined) {
      if (isNaN(mileage) || mileage < 0) {
        return res
          .status(400)
          .json({ message: "Mileage must be a positive number" });
      }
      car.mileage = Number(mileage);
    }

    if (make !== undefined) car.make = make;
    if (model !== undefined) car.model = model;
    if (description !== undefined) car.description = description;
    if (location !== undefined) car.location = location;

    if (req.files && req.files.length > 0) {
      car.images = req.files.map((file) => file.path);
    }

    await car.save();

    const updatedCar = await Car.findById(car._id).populate(
      "seller",
      "name email role"
    );
    res.json(updatedCar);
  } catch (err) {
    next(err);
  }
};

export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.seller.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this car" });
    }

    await car.deleteOne();
    res.json({ message: "Car deleted" });
  } catch (error) {
    next(error);
  }
};

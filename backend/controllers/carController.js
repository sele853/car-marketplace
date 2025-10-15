import Car from "../models/car.js";

export const getCars = async (req, res, next) => {
  try {
    const {
      search, 
      minPrice, maxPrice, minYear, maxYear, minMileage, maxMileage,
      sortBy = 'createdAt', 
      page = 1, limit = 10
    } = req.query;

    const match = {};
    if (search) {
      match.$text = { $search: search }; 
    }
    if (minPrice) match.price = { ...match.price, $gte: Number(minPrice) };
    if (maxPrice) match.price = { ...match.price, $lte: Number(maxPrice) };
    if (minYear) match.year = { ...match.year, $gte: Number(minYear) };
    if (maxYear) match.year = { ...match.year, $lte: Number(maxYear) };
    if (minMileage) match.mileage = { ...match.mileage, $gte: Number(minMileage) };
    if (maxMileage) match.mileage = { ...match.mileage, $lte: Number(maxMileage) };

    const sort = {};
    if (sortBy) {
      const [field, dir = 'asc'] = sortBy.split(':'); 
      sort[field] = dir === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; 
    }

    
    const aggregate = [
      { $match: match },
      { $sort: sort },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      { $lookup: { from: 'users', localField: 'seller', foreignField: '_id', as: 'seller' } },
      { $unwind: '$seller' },
      { $project: { 'seller.password': 0 } } 
    ];

    const cars = await Car.aggregate(aggregate);

    
    const statsAggregate = [
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ];
    const [stats] = await Car.aggregate(statsAggregate);

    res.json({
      cars,
      total: stats?.total || 0,
      page: Number(page),
      pages: Math.ceil((stats?.total || 0) / limit),
      stats: {
        avgPrice: stats?.avgPrice || 0,
        minPrice: stats?.minPrice || 0,
        maxPrice: stats?.maxPrice || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "seller",
      "name email"
    );
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    next(error);
  }
};

export const createCar = async (req, res, next) => {
  try {
    const { make, model, year, price, mileage, description, location } =
      req.body;
    if (!make || !model || !year || !price || !mileage) {
      return res
        .status(400)
        .json({
          message: "make, model, year, price, and mileage are required",
        });
    }
    const images = req.files ? req.files.map((file) => file.path) : [];
    const car = new Car({
      make,
      model,
      year,
      price,
      mileage,
      description,
      location,
      images,
      seller: req.user.id,
    });
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (req, res, next) => {
  try {
    // ✅ FIX 1: Don't populate seller for authorization check
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // ✅ FIX 2: Compare seller ID directly (car.seller is ObjectId)
    if (car.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this car" });
    }

    // ✅ Input validation
    const { make, model, year, price, mileage, description, location } = req.body;
    
    if (year && (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1)) {
      return res.status(400).json({ message: "Invalid year" });
    }
    if (price && (isNaN(price) || price < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    if (mileage && (isNaN(mileage) || mileage < 0)) {
      return res.status(400).json({ message: "Mileage must be a positive number" });
    }

    // ✅ Update fields
    if (make !== undefined) car.make = make;
    if (model !== undefined) car.model = model;
    if (year !== undefined) car.year = Number(year);
    if (price !== undefined) car.price = Number(price);
    if (mileage !== undefined) car.mileage = Number(mileage);
    if (description !== undefined) car.description = description;
    if (location !== undefined) car.location = location;

    // ✅ FIX 3: Correct image handling for array upload
    if (req.files && req.files.length > 0) {
      car.images = req.files.map((file) => file.path);
    }

    await car.save();

    // ✅ FIX 4: Populate AFTER save for response
    const updatedCar = await Car.findById(car._id).populate("seller", "name email");
    
    res.json(updatedCar);
  } catch (err) {
    next(err);
  }
};

export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.seller.toString() !== req.user.id) {
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

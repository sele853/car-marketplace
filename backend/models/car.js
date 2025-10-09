import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
    make: {type:String , required:true},
    model: {type:String , required:true},
    year: {type:Number , required:true},
    price: {type:Number , required:true},
    mileage: {type:Number , required:true},
    description: {type:String},
    images: [{type:String}],
    seller: { type: mongoose.Schema.Types.ObjectId , ref: 'User' , required:true},
    location: {type: String}
},{timestamps:true});

const Car = mongoose.model('Car',carSchema);
export default Car;
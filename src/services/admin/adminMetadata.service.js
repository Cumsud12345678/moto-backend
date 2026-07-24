const Product = require('../../models/product.model')
const Make = require('../../models/make.model')
const Model = require('../../models/model.model')
const Category = require('../../models/category.model')
const Fuel = require('../../models/fuel.model')
const Speed = require('../../models/speed.model')
const City = require('../../models/city.model')
const Color = require('../../models/color.model')
const Status = require('../../models/status.model')
const User = require('../../models/user.model')
const Equipment = require('../../models/equipment.model')


const getMetadata = async () => {
  const [ 
    make, model, category, fuel, speed, city, color, status, equipment
  ] = await Promise.all([
    Make.find(),
    Model.find().populate('make'),
    Category.find(),
    Fuel.find(),
    Speed.find(),
    City.find(),
    Color.find(),
    Status.find(),
    Equipment.find()
  ])

  return {
    make,
    model,
    category,
    fuel,
    speed,
    city,
    color,
    status,
    equipment
  }
}

const createMetadata = async (data, logo = null, models = null) => {
  if(data.make) {
    let make = await Make.findOne({label: data.make})
    if(!make) {
      make = await Make.create({logo: logo, label: data.make})
    }
    if(models) {
      for(const model of models) {
        await Model.create({
          label: model,
          make: make._id
        })
      }
    }
  } 
  if(data.category) await Category.create({label: data.category});
  if(data.fuel) await Fuel.create({label: data.fuel});
  if(data.city) await City.create({label: data.city});
  if(data.color) await Color.create({label: data.color});
  if(data.speed) await Speed.create({label: data.speed});
  if(data.status) await Status.create({label: data.status});
  if(data.equipment) await Equipment.create({label: data.equipment});
  return true
}


const getMake = async (id) => {
  return await Make.findById(id)
}


const deleteMetadata = async (data) => {
  if(data.type == 'makes') {
    await Make.findByIdAndDelete(data.id)
    await Model.deleteMany({make: data.id})
  };
  if(data.type == 'models') await Model.findByIdAndDelete(data.id);
  if(data.type == 'categories') await Category.findByIdAndDelete(data.id);
  if(data.type == 'fuels') await Fuel.findByIdAndDelete(data.id);
  if(data.type == 'cities') await City.findByIdAndDelete(data.id);
  if(data.type == 'colors') await Color.findByIdAndDelete(data.id);
  if(data.type == 'speeds') await Speed.findByIdAndDelete(data.id);
  if(data.type == 'statuses') await Status.findByIdAndDelete(data.id);
  if(data.type == 'equipments') await Equipment.findByIdAndDelete(data.id);
  return true
}


module.exports = {
  getMetadata,
  createMetadata,
  getMake,
  deleteMetadata
}
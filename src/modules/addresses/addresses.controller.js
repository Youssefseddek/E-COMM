import { Address } from "../../../DB/models/index.js";
import { ErrorClass } from "../../utils/index.js";
import axios from "axios";


/**
 * @api {add} /addresses/add add Address
 */
export const addAddress = async (req, res, next) => {
    const {
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        setAsDefault,
    } = req.body;
    const userId = req.user._id;

    const cities = await axios.get("https://api.api-ninjas.com/v1/city?country=EG", {
        headers: {
            "X-Api-Key": "lWxq+//usEK1jbgVXHJ+AA==Wv1363vLvmMYvT5Q"
        }
    })
    console.log(cities.data);
    
    const isCityExist = cities.data.find(c => c.name == city)
    if (!isCityExist) {
        return next(new ErrorClass("City not found", 404, "City not found"))
    }

    const address = new Address({
        userId,
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false
    });
    console.log(address);

    // if the new address is default we need to  update the old defult address to be not default
    if (address.setAsDefault) {
        await Address.updateOne({ userId, isDefault: true }, { isDefault: false });
    }

    const newAddress = await address.save();

    res.status(201).json({
        message: "Address added successfully",
        data: newAddress,
    });
};


/**
 * @api {put} /addresses/edit/:id update Address by id
 */
export const updateAddress = async (req, res, next) => {
    const { id } = req.params;
    console.log({ id, userId: req.user._id });

    const {
        country,
        city,
        postalCode,
        buildingNumber,
        floorNumber,
        addressLabel,
        setAsDefault } = req.body

    const address = await Address.findOne({ _id: id, userId: req.user._id, isMarkedAsDeleted: false })
    if (!address) {
        return next(new ErrorClass("Address not found", 404, "Address not found"))
    }
    if (country) address.country = country
    if (city) address.city = city
    if (postalCode) address.postalCode = postalCode
    if (buildingNumber) address.buildingNumber = buildingNumber
    if (floorNumber) address.floorNumber = floorNumber
    if (addressLabel) address.addressLabel = addressLabel

    if ([true, false].includes(setAsDefault)) {
        address.isDefault = [true, false].includes(setAsDefault) ? setAsDefault : false
        await Address.updateOne({ userId: req.user._id, isDefault: true }, { isDefault: false })

    }

    await address.save()

    res.status(200).json({
        message: "Address updated successfully",
        data: address,
    });


}

/**
 * @api {delete} /addresses/soft-delete/:id soft delete Address by id
 */
export const softDeleteAddress = async (req, res, next) => {
    const { id } = req.params;

    const address = await Address.findOneAndUpdate(
        { _id: id, userId: req.user._id, isMarkedAsDeleted: false },
        { isMarkedAsDeleted: true },
        { new: true }
    )

    if (!address) {
        return next(new ErrorClass("Address not found", 404, "Address not found"))
    }

    res.status(200).json({
        message: "Address deleted successfully",
        data: address,
    });

}


/**
 * @api {get} /addresses get Addresses
 */
export const getAddresses = async (req, res, next) => {
    const { id } = req.params;
    const addAddresses = await Address.find({ userId: req.user._id, isMarkedAsDeleted: false })
    if (!addAddress.length) {
        return next(new ErrorClass("Address not found", 404, "Address not found"))
    }
    res.status(200).json({
        message: "Address found successfully",
        data: addAddresses,
    });
}
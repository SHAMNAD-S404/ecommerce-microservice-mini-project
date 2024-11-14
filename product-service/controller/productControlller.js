const productDB = require("../model/productModel");


const getProducts = async (req,res) => {

    try {     
        const products = await productDB.find();
        return res.status(200).json(products);

    } catch (error) {
        console.error(error);
        
    }

}


const createProducts = async(req,res) => {

    try {
        
        const { name, description, price } = req.body;
        const newProduct = new productDB({
            name,
            description,
            price
        });
    
        newProduct.save();
        return res.status(200).json({ success: `${newProduct.name} : product was added successfully!`});

    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    getProducts,
    createProducts
}

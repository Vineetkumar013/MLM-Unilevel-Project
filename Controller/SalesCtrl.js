const Sale = require("../Models/SalesModel");
const Distributor = require("../Models/distributorModel");

const CreateSales = async (req, res) => {
  const { distributorId, saleId } = req.body;
  try {
    const sales = await Sale.findById(saleId);
    const distributor = await Distributor.findById(distributorId);
    const retailCommission = sales.MRP - sales.DP;

    distributor.sales += retailCommission;
    distributor.bv += retailCommission;
    await distributor.save();

    res.json({ retailCommission });
    // // Update the total sales made by the distributor
    // await Distributor.findByIdAndUpdate(distributorId, {
    //   $inc: { sales: amount },
    // });

    res.status(201).json({ message: "Sale added successfully" });
  } catch (error) {
    console.error("Failed to add sale", error);
    res.status(500).json({ error: "Failed to add sale" });
  }
};

module.exports = {
  CreateSales,
};

const { BigNumber } = require('@ethersproject/bignumber');
const chai = require('chai');
const { expect } = chai;
const { solidity } = require('ethereum-waffle');
const { ethers } = require('hardhat');
const assert = require('assert');
const exp = require('constants');
chai.use(solidity);

let SupplyChain,
  owner,
  supplierAddr,
  manufacturerAddr,
  distributorAddr,
  retailerAddr,
  testAddr;

describe('Supply Chain', () => {
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [
      owner,
      supplierAddr,
      manufacturerAddr,
      distributorAddr,
      retailerAddr,
      testAddr,
      _,
    ] = accounts;
    SupplyChain = await ethers.getContractFactory('SupplyChain');
    sc = await SupplyChain.deploy();
    await sc.deployed();
    //console.log(sc.address);
    //console.log(owner.address);
  });
  describe('Add participants', async () => {
    it('allows owner to add material supplier', async () => {
      await sc
        .connect(owner)
        .addRawMaterialSupplier(supplierAddr.address, 'supplier1', 'delhi');
      const supplier = await sc.RMSupplierList(1);
      expect(await supplier.name).to.equal('supplier1');
      expect(await supplier.location).to.equal('delhi');
      expect(await supplier.addr).to.equal(supplierAddr.address);
      expect(await supplier.id.toNumber()).to.equal(1);
      expect(await sc.rawMaterialsCounter()).to.equal(1);
    });

    it('allows owner to add manufacturer', async () => {
      await sc
        .connect(owner)
        .addManufacturer(manufacturerAddr.address, 'manufacturer1', 'jaipur');
      const manufacturer = await sc.manufacturerList(1);
      expect(await manufacturer.name).to.equal('manufacturer1');
      expect(await manufacturer.location).to.equal('jaipur');
      expect(await manufacturer.addr).to.equal(manufacturerAddr.address);
      expect(await manufacturer.id.toNumber()).to.equal(1);
      expect(await sc.manufacturerCounter()).to.equal(1);
    });

    it('allows owner to add distributor', async () => {
      await sc
        .connect(owner)
        .addDistributor(distributorAddr.address, 'distributor1', 'surat');
      const distributor = await sc.distributorList(1);
      expect(await distributor.name).to.equal('distributor1');
      expect(await distributor.location).to.equal('surat');
      expect(await distributor.addr).to.equal(distributorAddr.address);
      expect(await distributor.id.toNumber()).to.equal(1);
      expect(await sc.distributorCounter()).to.equal(1);
    });

    it('allows owner to add retailer', async () => {
      await sc
        .connect(owner)
        .addRetailer(retailerAddr.address, 'retailer1', 'mumbai');
      const retailer = await sc.retailerList(1);
      expect(await retailer.name).to.equal('retailer1');
      expect(await retailer.location).to.equal('mumbai');
      expect(await retailer.addr).to.equal(retailerAddr.address);
      expect(await retailer.id.toNumber()).to.equal(1);
      expect(await sc.retailerCounter()).to.equal(1);
    });

    it('allows owner to add medicine', async () => {
      await sc
        .connect(owner)
        .addRawMaterialSupplier(supplierAddr.address, 'supplier1', 'delhi');
      await sc
        .connect(owner)
        .addManufacturer(manufacturerAddr.address, 'manufacturer1', 'jaipur');
      await sc
        .connect(owner)
        .addDistributor(distributorAddr.address, 'distributor1', 'surat');
      await sc
        .connect(owner)
        .addRetailer(retailerAddr.address, 'retailer1', 'mumbai');
      await sc.connect(owner).addMedicine('crocin', 'fever');
      const medicine = await sc.MedicineStock(1);
      expect(await medicine.medName).to.equal('crocin');
      expect(await medicine.description).to.equal('fever');
      expect(await medicine.id.toNumber()).to.equal(1);
    });
  });

  describe('Initiate Supply chain', () => {
    beforeEach(async () => {
      await sc
        .connect(owner)
        .addRawMaterialSupplier(
          supplierAddr.address,
          'Supplier 1',
          'Location 1'
        );
      await sc
        .connect(owner)
        .addManufacturer(manufacturerAddr.address, 'manufacturer1', 'jaipur');
      await sc
        .connect(owner)
        .addDistributor(distributorAddr.address, 'distributor1', 'surat');
      await sc
        .connect(owner)
        .addRetailer(retailerAddr.address, 'retailer1', 'mumbai');
      await sc.connect(owner).addMedicine('crocin', 'fever');
    });
    it('should allow a raw material supplier to supply raw materials', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      const medicine = await sc.MedicineStock(1);
      expect(medicine.status).to.equal(1);
      expect(medicine.RMid.toNumber()).to.equal(1);
    });

    it('should allow manufacturer to begin manufacturing', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      const medicine = await sc.MedicineStock(1);
      expect(medicine.status).to.equal(2);
      expect(medicine.MANid.toNumber()).to.equal(1);
    });
    it('should allow distributor to begin distribution', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      await sc.connect(distributorAddr).distribute(1);
      const medicine = await sc.MedicineStock(1);
      expect(medicine.status).to.equal(3);
      expect(medicine.DISid.toNumber()).to.equal(1);
    });
    it('should allow retailer to keep medicine for selling', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      await sc.connect(distributorAddr).distribute(1);
      await sc.connect(retailerAddr).retail(1);
      const medicine = await sc.MedicineStock(1);
      expect(medicine.status).to.equal(4);
      expect(medicine.RETid.toNumber()).to.equal(1);
    });
    it('should allow retailer to sell medicine', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      await sc.connect(distributorAddr).distribute(1);
      await sc.connect(retailerAddr).retail(1);
      await sc.connect(retailerAddr).sell(1);
      const medicine = await sc.MedicineStock(1);
      expect(medicine.status).to.equal(5);
    });
  });

  describe('Get current status', () => {
    beforeEach(async () => {
      await sc
        .connect(owner)
        .addRawMaterialSupplier(
          supplierAddr.address,
          'Supplier 1',
          'Location 1'
        );
      await sc
        .connect(owner)
        .addManufacturer(manufacturerAddr.address, 'manufacturer1', 'jaipur');
      await sc
        .connect(owner)
        .addDistributor(distributorAddr.address, 'distributor1', 'surat');
      await sc
        .connect(owner)
        .addRetailer(retailerAddr.address, 'retailer1', 'mumbai');
      await sc.connect(owner).addMedicine('crocin', 'fever');
    });

    it('should return status as "Raw material supply stage" when medicine is at raw material supplier', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      let status = await sc.getStatus(1);
      expect(status).to.equal('Raw material supply stage');
    });
    it('should return status as "Medicine in manufacturing" when medicine is with manufacturer', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      let status = await sc.getStatus(1);
      expect(status).to.equal('Medicine in manufacturing');
    });
    it('should return status as "Medicine out for distribution" when medicine is with distributor', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      await sc.connect(distributorAddr).distribute(1);
      let status = await sc.getStatus(1);
      expect(status).to.equal('Medicine out for distribution');
    });

    it('should return status as "Medicine available with retailer" when medicine is with retailer', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      await sc.connect(distributorAddr).distribute(1);
      await sc.connect(retailerAddr).retail(1);
      let status = await sc.getStatus(1);
      expect(status).to.equal('Medicine available with retailer');
    });

    it('should return status as "Medicine sold" when medicine is sold', async () => {
      await sc.connect(supplierAddr).rmSupply(1);
      await sc.connect(manufacturerAddr).manufacture(1);
      await sc.connect(distributorAddr).distribute(1);
      await sc.connect(retailerAddr).retail(1);
      await sc.connect(retailerAddr).sell(1);
      let status = await sc.getStatus(1);
      expect(status).to.equal('Medicine sold');
    });
  });
});

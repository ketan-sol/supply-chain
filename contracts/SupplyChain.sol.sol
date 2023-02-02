// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract SupplyChain {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }

    mapping(uint256 => medicine) public MedicineStock;
    mapping(uint256 => rawMaterialSupplier) public RMSupplierList;
    mapping(uint256 => manufacturer) public manufacturerList;
    mapping(uint256 => distributor) public distributorList;
    mapping(uint256 => retailer) public retailerList;

    enum Status {
        init,
        RawMaterialSupply,
        InManufacturing,
        OutForDistribution,
        WithRetailer,
        Sold
    }
    struct medicine {
        uint256 id;
        string medName;
        string description;
        uint256 RMid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        Status status;
    }

    struct rawMaterialSupplier {
        address addr;
        uint256 id;
        string name;
        string location;
    }

    struct manufacturer {
        address addr;
        uint256 id;
        string name;
        string location;
    }

    struct distributor {
        address addr;
        uint256 id;
        string name;
        string location;
    }

    struct retailer {
        address addr;
        uint256 id;
        string name;
        string location;
    }

    uint256 public medicineCounter = 0;
    uint256 public rawMaterialsCounter = 0;
    uint256 public manufacturerCounter = 0;
    uint256 public distributorCounter = 0;
    uint256 public retailerCounter = 0;

    function getStatus(uint256 _medId) public view returns (string memory) {
        require(medicineCounter > 0);
        if (MedicineStock[_medId].status == Status.init)
            return "medicine ordered";
        else if (MedicineStock[_medId].status == Status.RawMaterialSupply)
            return "Raw material supply stage";
        else if (MedicineStock[_medId].status == Status.InManufacturing)
            return "Medicine in manufacturing";
        else if (MedicineStock[_medId].status == Status.OutForDistribution)
            return "Medicine out for distribution";
        else if (MedicineStock[_medId].status == Status.WithRetailer)
            return "Medicine available with retailer";
        else if (MedicineStock[_medId].status == Status.Sold)
            return "Medicine sold";
        return ("Something went wrong");
    }

    function addRawMaterialSupplier(
        address _addr,
        string memory _name,
        string memory _location
    ) public onlyOwner {
        rawMaterialsCounter++;
        RMSupplierList[rawMaterialsCounter] = rawMaterialSupplier(
            _addr,
            rawMaterialsCounter,
            _name,
            _location
        );
    }

    function addManufacturer(
        address _addr,
        string memory _name,
        string memory _location
    ) public onlyOwner {
        manufacturerCounter++;
        manufacturerList[manufacturerCounter] = manufacturer(
            _addr,
            manufacturerCounter,
            _name,
            _location
        );
    }

    function addDistributor(
        address _addr,
        string memory _name,
        string memory _location
    ) public onlyOwner {
        distributorCounter++;
        distributorList[distributorCounter] = distributor(
            _addr,
            distributorCounter,
            _name,
            _location
        );
    }

    function addRetailer(
        address _addr,
        string memory _name,
        string memory _location
    ) public onlyOwner {
        retailerCounter++;
        retailerList[retailerCounter] = retailer(
            _addr,
            retailerCounter,
            _name,
            _location
        );
    }

    function rmSupply(uint256 _medId) public {
        require(_medId > 0 && _medId <= medicineCounter);
        uint256 id = findRMsupplier(msg.sender);
        require(id > 0, "supplier not available on chain");
        require(MedicineStock[_medId].status == Status.init);
        MedicineStock[_medId].RMid = id;
        MedicineStock[_medId].status = Status.RawMaterialSupply;
    }

    function findRMsupplier(address _address) private view returns (uint256) {
        require(rawMaterialsCounter > 0);
        for (uint256 i = 1; i <= rawMaterialsCounter; i++) {
            if (RMSupplierList[i].addr == _address) return RMSupplierList[i].id;
        }
        return 0;
    }

    function manufacture(uint256 _medId) public {
        require(_medId > 0 && _medId <= medicineCounter);
        uint256 id = findManufacturer(msg.sender);
        require(id > 0, "manufacturer not available on chain");
        require(MedicineStock[_medId].status == Status.RawMaterialSupply);
        MedicineStock[_medId].MANid = id;
        MedicineStock[_medId].status = Status.InManufacturing;
    }

    function findManufacturer(address _address) private view returns (uint256) {
        require(manufacturerCounter > 0);
        for (uint256 i = 1; i <= manufacturerCounter; i++) {
            if (manufacturerList[i].addr == _address)
                return manufacturerList[i].id;
        }
        return 0;
    }

    function distribute(uint256 _medId) public {
        require(_medId > 0 && _medId <= medicineCounter);
        uint256 id = findDistributor(msg.sender);
        require(id > 0, "Distributor not available on chain");
        require(MedicineStock[_medId].status == Status.InManufacturing);
        MedicineStock[_medId].DISid = id;
        MedicineStock[_medId].status = Status.OutForDistribution;
    }

    function findDistributor(address _address) private view returns (uint256) {
        require(distributorCounter > 0);
        for (uint256 i = 1; i <= distributorCounter; i++) {
            if (distributorList[i].addr == _address)
                return distributorList[i].id;
        }
        return 0;
    }

    function retail(uint256 _medId) public {
        require(_medId > 0 && _medId <= medicineCounter);
        uint256 id = findRetailer(msg.sender);
        require(id > 0, "Retailer not available on chain");
        require(MedicineStock[_medId].status == Status.OutForDistribution);
        MedicineStock[_medId].RETid = id;
        MedicineStock[_medId].status = Status.WithRetailer;
    }

    function findRetailer(address _address) private view returns (uint256) {
        require(retailerCounter > 0);
        for (uint256 i = 1; i <= retailerCounter; i++) {
            if (retailerList[i].addr == _address) return retailerList[i].id;
        }
        return 0;
    }

    function sell(uint256 _medId) public {
        require(_medId > 0 && _medId <= medicineCounter);
        uint256 id = findRetailer(msg.sender);
        require(id > 0, "Retailer not available on chain");
        require(id == MedicineStock[_medId].RETid);
        require(MedicineStock[_medId].status == Status.WithRetailer);
        MedicineStock[_medId].status = Status.Sold;
    }

    function addMedicine(string memory _name, string memory _description)
        public
        onlyOwner
    {
        require(
            (rawMaterialsCounter > 0) &&
                (manufacturerCounter > 0) &&
                (distributorCounter > 0) &&
                (retailerCounter > 0)
        );
        medicineCounter++;
        MedicineStock[medicineCounter] = medicine(
            medicineCounter,
            _name,
            _description,
            0,
            0,
            0,
            0,
            Status.init
        );
    }
}

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Web3 from 'web3';
import abi from '';

function addMedicine() {
  const history = useHistory();
  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const [currentAccount, setCurrentAcount] = useState('');
  const [loader, setLoader] = useState(true);
  const [SupplyChain, setSupplyChain] = useState();
  const [MED, setMED] = useState();
  const [MedicineName, setMedicineName] = useState();
  const [MedicineInfo, setMedicineInfo] = useState();
  const [MedicineStage, setMedicineStage] = useState();

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  };

  const loadBlockchainData = async () => {
    setLoader(true);
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    setCurrentAcount(account);
    const networkId = await web3.eth.net.getId();
    const networkData = abi.networks[networkId];
    if (networkData) {
      const supplychain = new web3.eth.Contract(abi.abi, networkData.address);
      setSupplyChain(supplychain);
      var i;
      const medCtr = await supplychain.methods.MedicineCounter().call();
      const med = {};
      const medStage = [];
      for (i = 0; i < medCtr; i++) {
        med[i] = await supplychain.methods.MedicineStock(i + 1).call();
        medStage[i] = await supplychain.methods.getStatus(i + 1).call();
      }
      setMED(med);
      setMedicineStage(medStage);
      setLoader(false);
    } else {
      window.alert('The smart contract is not deployed to current network');
    }
    if (loader) {
      return (
        <div>
          <h1 className="wait">Loading....</h1>
        </div>
      );
    }
    const redirect_to_home = () => {
      history.push('/');
    };
    const handlerChangeNameMED = (event) => {
      setMedicineName(event.target.value);
    };
    const handlerChangeInfoMED = (event) => {
      setMedicineInfo(event.target.value);
    };
    const handlerSubmitMED = async (event) => {
      event.preventDefault();
      try {
        var receipt = await SupplyChain.methods
          .addMedicine(MedicineName, MedicineInfo)
          .send({ from: currentAccount });
        if (receipt) {
          loadBlockchainData();
        }
      } catch (err) {
        alert('An error occurred!!');
      }
    };
    return (
      <div>
        <span>
          <b>Current Account Address:</b> {currentAccount}
        </span>
        <span
          onClick={redirect_to_home}
          className="btn btn-outline-danger btn-sm"
        >
          {' '}
          HOME
        </span>
        <br />
        <h5>Add Medicine Order:</h5>
        <form onSubmit={handlerSubmitMED}>
          <input
            className="form-control-sm"
            type="text"
            onChange={handlerChangeNameMED}
            placeholder="Medicine Name"
            required
          />
          <input
            className="form-control-sm"
            type="text"
            onChange={handlerChangeInfoMED}
            placeholder="Medicine Information"
            required
          />
          <button
            className="btn btn-outline-success btn-sm"
            onSubmit={handlerSubmitMED}
          >
            Order
          </button>
        </form>
        <br />
        <h5>Ordered Medicines:</h5>
        <table className="table table-bordered">
          <thread>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Information</th>
              <th scope="col">Current Status</th>
            </tr>
          </thread>
          <tbody>
            {Object.keys(MED).map(function (key) {
              return (
                <tr key={key}>
                  <td>{MED[key].id}</td>
                  <td>{MED[key].name}</td>
                  <td>{MED[key].information}</td>
                  <td>{MedicineStage[key]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
}

export default addMedicine;

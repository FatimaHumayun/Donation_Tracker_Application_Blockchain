import React, { useEffect, useState } from "react";
import Web3 from "web3";
import DonationTracker from "../contracts/DonationTracker.json";
import "./donation.css";

const Donation = () => {
  const [contract, setContract] = useState(null);
  const [donationAmounts, setDonationAmounts] = useState({
    healthcare: "",
    education: "",
    lifestyle: "",
  });
  const [donorAddress, setDonorAddress] = useState("");
  const [message, setMessage] = useState("");

  const contractAddress = "0x7A65B226E22b9ce32bbfDd0cb3c5195fdCaBbDe0";

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        // Request account access if no accounts are connected
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
          console.error("User denied account access:", error);
          setMessage("Please connect to MetaMask.");
          return; // Exit if access is denied
        }

        // Get the user's accounts
        const accounts = await web3.eth.getAccounts();
        setDonorAddress(accounts[0]); // Set the first account as the donor

        // Initialize the contract
        const donationTrackerContract = new web3.eth.Contract(
          DonationTracker.abi,
          contractAddress
        );
        setContract(donationTrackerContract);
      } else {
        setMessage("Please install MetaMask!");
      }
    };
    loadBlockchainData();
  }, []);

  const handleDonation = async (category) => {
    if (contract && donorAddress) {
      try {
        if (!donationAmounts[category]) {
          setMessage("Please enter a donation amount.");
          return;
        }

        // Convert amount to Wei (smallest unit of Ether)
        const amountInWei = Web3.utils.toWei(
          donationAmounts[category],
          "ether"
        );
        console.log("Amount in Wei: ", amountInWei); // Log the converted amount

        // Call the donate function
        await contract.methods.donate(category).send({
          from: donorAddress,
          value: amountInWei,
        });

        setMessage(
          `Successfully donated ${donationAmounts[category]} ETH to ${category}!`
        );
        setDonationAmounts((prev) => ({ ...prev, [category]: "" }));
      } catch (error) {
        console.error("Transaction error:", error);
        setMessage("Transaction failed! Please try again.");
      }
    } else {
      setMessage("Please enter a valid amount and your address.");
    }
  };

  return (
    <div className="donation-container">
      <h1>Donation Tracker</h1>
      {message && <p className="message">{message}</p>}
      <h3>Donation Categories</h3>
      {["healthcare", "education", "lifestyle"].map((category) => (
        <div className="category-container" key={category}>
          <h4 className="category-title">{category}</h4>
          <input
            type="text"
            placeholder="Amount in ETH"
            value={donationAmounts[category]}
            onChange={(e) =>
              setDonationAmounts((prev) => ({
                ...prev,
                [category]: e.target.value,
              }))
            }
          />
          <button onClick={() => handleDonation(category)}>Donate</button>
        </div>
      ))}
    </div>
  );
};

export default Donation;

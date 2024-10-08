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
  const [donations, setDonations] = useState({
    healthcare: [],
    education: [],
    lifestyle: [],
  });
  const [message, setMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState({
    healthcare: false,
    education: false,
    lifestyle: false,
  });

  const contractAddress = "0xF5fb4AA1eb9E7a3eC73b31881C88C342a70878Ea";

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
          console.error("User denied account access:", error);
          setMessage("Please connect to MetaMask.");
          return; // Exit if access is denied
        }

        // Initialize the contract
        const donationTrackerContract = new web3.eth.Contract(
          DonationTracker.abi,
          contractAddress
        );
        setContract(donationTrackerContract);

        // Load donations for each category
        await loadDonations("healthcare");
        await loadDonations("education");
        await loadDonations("lifestyle");
      } else {
        setMessage("Please install MetaMask!");
      }
    };
    loadBlockchainData();
  }, []);

  const loadDonations = async (category) => {
    if (contract) {
      const donationsData = await contract.methods
        .getDonationsByCategory(category)
        .call();
      setDonations((prev) => ({
        ...prev,
        [category]: donationsData,
      }));
    }
  };

  const handleDonation = async (category) => {
    if (contract) {
      try {
        if (!donationAmounts[category]) {
          setMessage("Please enter a donation amount.");
          return;
        }

        const amountInWei = Web3.utils.toWei(
          donationAmounts[category],
          "ether"
        );

        // Call the donate function
        await contract.methods.donate(category).send({
          from: window.ethereum.selectedAddress,
          value: amountInWei,
        });

        setMessage(
          `Successfully donated ${donationAmounts[category]} ETH to ${category}!`
        );
        setDonationAmounts((prev) => ({ ...prev, [category]: "" }));

        // Reload donations for the category
        await loadDonations(category);
      } catch (error) {
        console.error("Transaction error:", error);
        setMessage("Transaction failed! Please try again.");
      }
    } else {
      setMessage("Please enter a valid amount and your address.");
    }
  };

  const toggleDropdown = (category) => {
    setShowDropdown((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
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

          <button onClick={() => toggleDropdown(category)}>
            {showDropdown[category]
              ? "Hide Past Donations"
              : "Show Past Donations"}
          </button>

          {showDropdown[category] && (
            <div className="donations-dropdown">
              <h5>Past Donations</h5>
              {donations[category].length > 0 ? (
                <ul>
                  {donations[category].map((donation, index) => (
                    <li key={index} className="donation-item">
                      <div className="donation-details">
                        <span className="donation-donor">
                          Donor: {donation.donor}
                        </span>
                        <br></br>
                        <span className="donation-amount">
                          Amount:{" "}
                          {Number(Web3.utils.fromWei(donation.amount, "ether"))}{" "}
                          ETH
                        </span>
                        <br></br>
                        <span className="donation-time">
                          Time:{" "}
                          {new Date(
                            Number(donation.timestamp) * 1000
                          ).toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No donations for this category yet.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Donation;

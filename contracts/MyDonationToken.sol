// // SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationTracker is ERC20, Ownable {
    // Struct to represent a donation
    struct Donation {
        address donor;
        uint256 amount;
        string category;
        uint256 timestamp;
    }

    // Mapping to store donations by category and by donor
    mapping(string => Donation[]) private donationsByCategory;
    mapping(address => Donation[]) private donationsByDonor;

    // Addresses for each donation category
    address payable private healthcareAccount =
        payable(0x6132b99815E22D9de3F6Db075459631e6664a94A);
    address payable private educationAccount =
        payable(0x6AFC290339E04027BBe5477EEA0708A8cd678C98);
    address payable private lifestyleAccount =
        payable(0x967127f5b529bA503dF631Fd995bECa94789F2eb);

    // Events for transparency
    event DonationMade(
        address indexed donor,
        uint256 amount,
        string category,
        uint256 timestamp
    );

    constructor() ERC20("DonationToken", "DTK") {
        _mint(msg.sender, 1000 * 10 ** decimals()); // Mint initial supply to the deployer
    }

    // Function to donate to a specific category
    function donate(string memory category) public payable {
        require(msg.value > 0, "Donation must be greater than zero");

        // Transfer Ether to the respective account based on the category
        if (
            keccak256(abi.encodePacked(category)) ==
            keccak256(abi.encodePacked("healthcare"))
        ) {
            healthcareAccount.transfer(msg.value);
        } else if (
            keccak256(abi.encodePacked(category)) ==
            keccak256(abi.encodePacked("education"))
        ) {
            educationAccount.transfer(msg.value);
        } else if (
            keccak256(abi.encodePacked(category)) ==
            keccak256(abi.encodePacked("lifestyle"))
        ) {
            lifestyleAccount.transfer(msg.value);
        } else {
            revert("Invalid category");
        }

        // Record the donation
        donationsByCategory[category].push(
            Donation(msg.sender, msg.value, category, block.timestamp)
        );
        donationsByDonor[msg.sender].push(
            Donation(msg.sender, msg.value, category, block.timestamp)
        );

        // Emit the event
        emit DonationMade(msg.sender, msg.value, category, block.timestamp);
    }

    // Function to get donations by category
    function getDonationsByCategory(
        string memory category
    ) public view returns (Donation[] memory) {
        return donationsByCategory[category];
    }

    // Function to get donations by donor
    function getDonationsByDonor(
        address donor
    ) public view returns (Donation[] memory) {
        return donationsByDonor[donor];
    }
}

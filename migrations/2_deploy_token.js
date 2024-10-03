// 2_deploy_token.js
const DonationTracker = artifacts.require("DonationTracker");

module.exports = function (deployer) {
  deployer.deploy(DonationTracker);
};

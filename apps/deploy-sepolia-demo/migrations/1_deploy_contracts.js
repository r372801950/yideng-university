const TestDeposit = artifacts.require("TestDeposit");
const CourseCertificate = artifacts.require("CourseCertificate");
const CourseMarket = artifacts.require("CourseMarket");
const YiDengToken = artifacts.require("YiDengToken");

module.exports = function(deployer) {
  // deployer.deploy(TestDeposit);
  deployer.deploy(CourseCertificate);
  deployer.deploy(CourseMarket);
  deployer.deploy(YiDengToken);
};

const CourseCertificate = artifacts.require("CourseCertificate");
const CourseMarket = artifacts.require("CourseMarket");
const YiDengToken = artifacts.require("YiDengToken");

module.exports =async function(deployer) {
  // deployer.deploy(CourseCertificate);
  // deployer.deploy(CourseMarket);
  // deployer.deploy(YiDengToken);
  // 部署 YiDengToken
  await deployer.deploy(YiDengToken);
  const token = await YiDengToken.deployed();

  // 部署 CourseCertificate
  await deployer.deploy(CourseCertificate);
  const certificate = await CourseCertificate.deployed();

  // 部署 CourseMarket，传入两个合约地址
  await deployer.deploy(CourseMarket, token.address, certificate.address);
};
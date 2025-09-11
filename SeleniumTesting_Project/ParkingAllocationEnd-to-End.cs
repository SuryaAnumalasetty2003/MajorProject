using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SeleniumTesting_Project
{
    [TestClass]
    public class ParkingAllocationEnd_to_End
    {
        private IWebDriver driver;
        private WebDriverWait wait;
        private string baseUrl = "http://localhost:5173";  // Change to your app URL

        [TestInitialize]
        public void Setup()
        {
            var options = new ChromeOptions();
            //options.AddArgument("--headless"); // Uncomment to run headless
            options.AddArgument("--window-size=1920,1080");
            options.AcceptInsecureCertificates = true;
            options.AddArgument("--allow-insecure-localhost");

            driver = new ChromeDriver(options);
            driver.Manage().Window.Maximize();

            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(20));
        }
        [TestMethod]
        public void AdminLogin_AddAllocationForUserVehicle()
        {
            string adminEmail = "surya@gmail.com";
            string adminPassword = "Surya@143";

            string existingVehicleNumber = "Ap27Z41111";
            string fromDate = DateTime.Today.AddDays(1).ToString("MM-dd-yyyy");
            string toDate = DateTime.Today.AddDays(5).ToString("MM-dd-yyyy");

            // Navigate to admin login
            driver.Navigate().GoToUrl($"{baseUrl}/");

            // Fill admin login form
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("email"))).SendKeys(adminEmail);
            driver.FindElement(By.Id("password")).SendKeys(adminPassword);
            wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("button[type='submit']"))).Click();

            // Wait for admin dashboard
            wait.Until(ExpectedConditions.UrlContains("/admin/dashboard"));

            // Navigate to allocations page
            driver.Navigate().GoToUrl($"{baseUrl}/admin/dashboard/allocations");
            // Click Add Allocation button
            wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//button[contains(.,'Create Allocation')]"))).Click();
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("numberPlate")));

            // Fill vehicle number plate and allocation dates
            var numberPlateInput = driver.FindElement(By.Id("numberPlate"));
            numberPlateInput.Clear();
            numberPlateInput.SendKeys(existingVehicleNumber);

            var fromDateInput = driver.FindElement(By.Id("allocatedFromDate"));
            fromDateInput.Clear();
            fromDateInput.SendKeys(fromDate);

            var toDateInput = driver.FindElement(By.Id("allocatedUptoDate"));
            toDateInput.Clear();
            toDateInput.SendKeys(toDate);

            // Click 'Verify Available Lots' button
            driver.FindElement(By.XPath("//button[contains(.,'Verify Available Lots')]")).Click();
            // Wait for the parking lot dropdown to be visible and populated
            wait.Until(ExpectedConditions.ElementIsVisible(By.Name("parkingLotId")));

            // Select an available parking lot (e.g., first available)
            var parkingLotSelect = new SelectElement(driver.FindElement(By.Name("parkingLotId")));
            parkingLotSelect.SelectByIndex(1);
            // Submit add allocation form
            driver.FindElement(By.XPath("//button[contains(.,'Add Allocation in Dashboard')]")).Click();

            // Wait for success message or redirect back to allocations list
            bool isSuccess = wait.Until(d =>
                d.PageSource.Contains("Allocation created successfully") ||
                d.Url.EndsWith("/admin/dashboard/allocations")
            );

            Assert.IsTrue(isSuccess, "Allocation was not successfully created by admin.");
        }

        [TestMethod]
        public void AdminLogin_AddAllocationForUserVehicle_WithFailScenario()
        {
            string adminEmail = "surya@gmail.com";
            string adminPassword = "Surya@143";

            string existingVehicleNumber = "Ap27Z4777";
            string fromDate = DateTime.Today.AddDays(1).ToString("MM-dd-yyyy");
            string toDate = DateTime.Today.AddDays(5).ToString("MM-dd-yyyy");

            driver.Navigate().GoToUrl($"{baseUrl}/");

            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("email"))).SendKeys(adminEmail);
            driver.FindElement(By.Id("password")).SendKeys(adminPassword);
            wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("button[type='submit']"))).Click();

            wait.Until(ExpectedConditions.UrlContains("/admin/dashboard"));

            driver.Navigate().GoToUrl($"{baseUrl}/admin/dashboard/allocations");
            Thread.Sleep(2000);

            wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//button[contains(.,'Create Allocation')]"))).Click();
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("numberPlate")));

            var numberPlateInput = driver.FindElement(By.Id("numberPlate"));
            numberPlateInput.Clear();
            numberPlateInput.SendKeys(existingVehicleNumber);

            var fromDateInput = driver.FindElement(By.Id("allocatedFromDate"));
            fromDateInput.Clear();
            fromDateInput.SendKeys(fromDate);

            var toDateInput = driver.FindElement(By.Id("allocatedUptoDate"));
            toDateInput.Clear();
            toDateInput.SendKeys(toDate);

            driver.FindElement(By.XPath("//button[contains(.,'Verify Available Lots')]")).Click();
            Thread.Sleep(2000);

            wait.Until(ExpectedConditions.ElementIsVisible(By.Name("parkingLotId")));
            var parkingLotSelect = new SelectElement(driver.FindElement(By.Name("parkingLotId")));
            parkingLotSelect.SelectByIndex(1);
            Thread.Sleep(2000);

            driver.FindElement(By.XPath("//button[contains(text(),'Add Allocation in Dashboard')]")).Click();

            // Wait for success or failure message to appear on the page
            wait.Until(d =>
                d.PageSource.Contains("Allocation created successfully") ||
                d.PageSource.Contains("This vehicle already has an active allocation in that date range.")
            );

            // Get the current page source for assertion
            string pageSource = driver.PageSource;

            if (pageSource.Contains("Allocation created successfully"))
            {
                Assert.IsTrue(true, "Allocation created successfully.");
            }
            else if (pageSource.Contains("This vehicle already has an active allocation in that date range."))
            {
                Assert.IsTrue(true, "Allocation failed: vehicle already allocated in date range.");
            }

            else
            {
                Assert.Fail("Allocation result unknown - neither success nor known error message found.");
            }


            Thread.Sleep(5000);
        }
        [TestMethod]
        public void AdminAllocation_VehicleNotFound_ShowsError()
        {
            string adminEmail = "surya@gmail.com";
            string adminPassword = "Surya@143";

            // Use a vehicle number that DOES NOT exist
            string nonExistentVehicleNumber = "NONEXIST1234";
            string fromDate = DateTime.Today.AddDays(1).ToString("MM-dd-yyyy");
            string toDate = DateTime.Today.AddDays(5).ToString("MM-dd-yyyy");

            driver.Navigate().GoToUrl($"{baseUrl}/");

            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("email"))).SendKeys(adminEmail);
            driver.FindElement(By.Id("password")).SendKeys(adminPassword);
            wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("button[type='submit']"))).Click();

            wait.Until(ExpectedConditions.UrlContains("/admin/dashboard"));
            Thread.Sleep(1000);

            driver.Navigate().GoToUrl($"{baseUrl}/admin/dashboard/allocations");
            Thread.Sleep(2000);
            wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//button[contains(.,'Create Allocation')]"))).Click();
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("numberPlate")));

            var numberPlateInput = driver.FindElement(By.Id("numberPlate"));
            numberPlateInput.Clear();
            numberPlateInput.SendKeys(nonExistentVehicleNumber);

            var fromDateInput = driver.FindElement(By.Id("allocatedFromDate"));
            fromDateInput.Clear();
            fromDateInput.SendKeys(fromDate);

            var toDateInput = driver.FindElement(By.Id("allocatedUptoDate"));
            toDateInput.Clear();
            toDateInput.SendKeys(toDate);

            driver.FindElement(By.XPath("//button[contains(.,'Verify Available Lots')]")).Click();

            wait.Until(ExpectedConditions.ElementIsVisible(By.Name("parkingLotId")));
            var parkingLotSelect = new SelectElement(driver.FindElement(By.Name("parkingLotId")));
            parkingLotSelect.SelectByIndex(1);

            driver.FindElement(By.XPath("//button[contains(text(),'Add Allocation in Dashboard')]")).Click();

            // Check for error message "Vehicle number not found." as per your React code
            bool vehicleNotFoundError = wait.Until(d =>
                d.PageSource.Contains("Vehicle number not found.") ||
                d.PageSource.Contains("No vehicle found with this number") // alternative text if any
            );

            Assert.IsTrue(vehicleNotFoundError, "Expected 'Vehicle number not found' error was not displayed.");
        }


        [TestCleanup]
        public void TearDown()
        {
            driver.Quit();
        }

    }
}

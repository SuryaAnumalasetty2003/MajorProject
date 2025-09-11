using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;

namespace SeleniumTesting_Project
{
    [TestClass]
    public class EndToEndUserFlowTests
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
        public void RegisterThenLoginAndVerifyDashboard()
        {
            // Generates a unique string using the current datetime
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff"); // e.g., 20250804120530999
            string uniqueEmail = $"dbhargavanandan@gmail.com";
            string uniqueMobile = "8121375363";
            string password = "Bhargav@521";
            // Navigate to registration page
            driver.Navigate().GoToUrl($"{baseUrl}/register");
            // Fill registration form fields by element ids or placeholders matching your React form
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("fullName")));
            driver.FindElement(By.Id("fullName")).SendKeys("Bhargav Nandhan");
            driver.FindElement(By.Id("email")).SendKeys(uniqueEmail);
            driver.FindElement(By.Id("mobileNumber")).SendKeys(uniqueMobile);
            driver.FindElement(By.Id("password")).SendKeys(password);
            driver.FindElement(By.Id("confirmPassword")).SendKeys(password);

            // Click Register button
            wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("button[type='submit']"))).Click();

            // If your app shows alert on registration success, handle it here:
            try
            {
                WebDriverWait alertWait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
                alertWait.Until(ExpectedConditions.AlertIsPresent());
                driver.SwitchTo().Alert().Accept();
            }
            catch (WebDriverTimeoutException)
            {
                // No alert appeared; ignore if not applicable in your app
            }

            wait.Until(ExpectedConditions.UrlContains("/"));
            // Wait for redirect to login page (assuming /login is your login route)


            // Wait for login inputs visible
            wait.Until(ExpectedConditions.ElementIsVisible(By.Id("email")));

            // Fill login form
            var emailInput = driver.FindElement(By.Id("email"));
            emailInput.Clear();
            emailInput.SendKeys(uniqueEmail);

            var passwordInput = driver.FindElement(By.Id("password"));
            passwordInput.Clear();
            passwordInput.SendKeys(password);

            // Click Login button
            wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("button[type='submit']"))).Click();


            // Optional early check for login failure message text
            if (driver.PageSource.Contains("Login failed") || driver.PageSource.Contains("Invalid login"))
                Assert.Fail("Login failed after registration.");

            // Wait for user dashboard URL (adjust route if different)
            wait.Until(ExpectedConditions.UrlContains("/user/dashboard"));
            System.Threading.Thread.Sleep(2000);

            // ---- ADD VEHICLE ----
            // If 'Register Vehicle' button exists, click it
            try
            {
                var registerVehicleBtn = wait.Until(ExpectedConditions.ElementIsVisible(By.XPath("//button[contains(text(), 'Register Vehicle')]")));
                registerVehicleBtn.Click();

            }
            catch (WebDriverTimeoutException)
            {
                Assert.Fail("Register Vehicle button not found on dashboard; vehicle may already be added.");
            }

            // Wait for Add Vehicle form
            wait.Until(ExpectedConditions.ElementIsVisible(By.XPath("//h2[contains(text(),'Add Vehicle')]")));

            // Generate unique number plate
            string numberPlate = "AP04K3629";

            driver.FindElement(By.Name("numberPlate")).SendKeys(numberPlate);
            driver.FindElement(By.Name("make")).SendKeys("Suzuki");
            driver.FindElement(By.Name("color")).SendKeys("Blue");

            var typeSelect = new SelectElement(driver.FindElement(By.Name("type")));
            typeSelect.SelectByText("Bike");

            // Submit vehicle
            driver.FindElement(By.XPath("//button[contains(text(),'Submit')]")).Click();

            // Wait for redirect back to dashboard
            wait.Until(ExpectedConditions.UrlContains("/user/dashboard"));



            // Verify vehicle info displayed on dashboard
            bool vehicleListed = wait.Until(d => d.PageSource.Contains(numberPlate) && d.PageSource.Contains("Suzuki"));

            Assert.IsTrue(vehicleListed, "Added vehicle not displayed on dashboard.");

            // Wait for and click "Add Allocation" button/link on user dashboard
            wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//button[contains(.,'Add Allocation')]"))).Click();

            // Wait for the Add Allocation form/modal heading
            wait.Until(ExpectedConditions.ElementIsVisible(By.XPath("//h2[contains(text(),'Add Parking Allocation')]")));

            // Fill the "fromDate" and "toDate" inputs with valid future dates
            var fromDateInput = driver.FindElement(By.Name("fromDate"));
            fromDateInput.Clear();
            fromDateInput.SendKeys(DateTime.Today.AddDays(1).ToString("MM-dd-yyyy"));

            var toDateInput = driver.FindElement(By.Name("toDate"));
            toDateInput.Clear();
            toDateInput.SendKeys(DateTime.Today.AddDays(3).ToString("MM-dd-yyyy"));

            // Click "Check Available Lots" button to load parking lots
            driver.FindElement(By.XPath("//button[contains(.,'Check Available Lots')]")).Click();

            // Wait for the parking lot dropdown to be visible and populated
            wait.Until(ExpectedConditions.ElementIsVisible(By.Name("parkingLotId")));

            // Select an available parking lot (e.g., first available)
            var parkingLotSelect = new SelectElement(driver.FindElement(By.Name("parkingLotId")));
            parkingLotSelect.SelectByIndex(1);

            // Submit allocation form
            driver.FindElement(By.XPath("//button[contains(.,'Allocate Slot')]")).Click();

            // Wait for redirect or confirmation by URL or element indicating dashboard page
            wait.Until(ExpectedConditions.UrlContains("/user/dashboard"));

        }

        [TestCleanup]
        public void TearDown()
        {
            driver.Quit();
        }
    }
}

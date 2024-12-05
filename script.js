const puppeteer = require('puppeteer');
let { id, pass } = require('./secret');
let dataFile = require('./data');

async function main() {
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });

    let pages = await browser.pages();
    let tab = pages[0];
    await tab.goto("https://internshala.com/");

    // Click login button on homepage
    await tab.waitForSelector('button[data-toggle="modal"][data-target="#login-modal"]');
    await tab.click('button[data-toggle="modal"][data-target="#login-modal"]');
    

    // Enter login credentials
    await tab.waitForSelector('input[type="email"]');
    await tab.type('input[type="email"]', id);

    await tab.waitForSelector('input[type="password"]');
    await tab.type('input[type="password"]', pass);

    await tab.waitForSelector('button[type="submit"]');
    await tab.click('button[type="submit"]');

    await tab.waitForNavigation({ waitUntil: "networkidle2" });

    // Open profile dropdown
    await tab.waitForSelector(".profile_container .dropdown-toggle");
    await tab.click(".profile_container .dropdown-toggle");

    // Get profile options
    let profileOptions = await tab.$$(".profile_options a");
    let appUrls = [];
    for (let i = 0; i < 11; i++) {
        let url = await tab.evaluate(function (ele) {
            return ele.getAttribute("href");
        }, profileOptions[i]);
        appUrls.push(url);
    }

    // Navigate to 'My Resume' page
    await tab.goto("https://internshala.com" + appUrls[1]);

    // Fill graduation details
    await tab.waitForSelector("#graduation-tab .ic-16-plus", { visible: true });
    await tab.click("#graduation-tab .ic-16-plus");
    await graduation(dataFile[0], tab);

    // Fill training details
    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");
    await training(dataFile[0], tab);

    // Skip skills addition
    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");
    await tab.waitForSelector(".btn.btn-secondary.skip.skip-button", { visible: true });
    await tab.click(".btn.btn-secondary.skip.skip-button");

    // Fill work sample
    await workSample(dataFile[0], tab);

    await tab.waitForSelector("#save_work_samples", { visible: true });
    await tab.click("#save_work_samples");

    // Apply for internships
    await application(dataFile[0], tab);

    await browser.close();
}

async function graduation(data, tab) {
    await tab.waitForSelector("#degree_completion_status_pursuing", { visible: true });
    await tab.click("#degree_completion_status_pursuing");

    await tab.waitForSelector("#college", { visible: true });
    await tab.type("#college", data["College"]);

    await tab.waitForSelector("#start_year_chosen", { visible: true });
    await tab.click("#start_year_chosen");
    await tab.waitForSelector(".active-result[data-option-array-index='5']", { visible: true });
    await tab.click(".active-result[data-option-array-index='5']");

    await tab.waitForSelector("#end_year_chosen", { visible: true });
    await tab.click("#end_year_chosen");
    await tab.waitForSelector(".active-result[data-option-array-index='6']", { visible: true });
    await tab.click(".active-result[data-option-array-index='6']");

    await tab.waitForSelector("#degree", { visible: true });
    await tab.type("#degree", data["Degree"]);

    await tab.waitForSelector("#stream", { visible: true });
    await tab.type("#stream", data["Stream"]);

    await tab.waitForSelector("#performance-college", { visible: true });
    await tab.type("#performance-college", data["Percentage"]);

    await tab.click("#college-submit");
}

async function training(data, tab) {
    await tab.waitForSelector(".experiences-tabs[data-target='#training-modal'] .ic-16-plus", { visible: true });
    await tab.click(".experiences-tabs[data-target='#training-modal'] .ic-16-plus");

    await tab.waitForSelector("#other_experiences_course", { visible: true });
    await tab.type("#other_experiences_course", data["Training"]);

    await tab.waitForSelector("#other_experiences_organization", { visible: true });
    await tab.type("#other_experiences_organization", data["Organization"]);

    await tab.click("#other_experiences_location_type_label");

    await tab.click("#other_experiences_start_date");
    let date = await tab.$$(".ui-state-default[href='#']");
    await date[0].click();

    await tab.click("#other_experiences_is_on_going");

    await tab.waitForSelector("#other_experiences_training_description", { visible: true });
    await tab.type("#other_experiences_training_description", data["description"]);

    await tab.click("#training-submit");
}

async function workSample(data, tab) {
    await tab.waitForSelector("#other_portfolio_link", { visible: true });
    await tab.type("#other_portfolio_link", data["link"]);
}

async function application(data, tab) {
    await tab.goto("https://internshala.com/internships");

    await tab.waitForSelector(".internship_list_container .internship_meta .view_detail_button", { visible: true });
    let details = await tab.$$(".internship_list_container .internship_meta .view_detail_button");
    let detailUrls = [];
    for (let i = 0; i < 3; i++) {
        let url = await tab.evaluate(ele => ele.getAttribute("href"), details[i]);
        detailUrls.push(url);
    }

    for (let url of detailUrls) {
        await apply(url, data, tab);
    }
}

async function apply(url, data, tab) {
    await tab.goto("https://internshala.com" + url);

    await tab.waitForSelector(".btn.btn-large", { visible: true });
    await tab.click(".btn.btn-large");

    await tab.waitForSelector("#application_button", { visible: true });
    await tab.click("#application_button");

    await tab.waitForSelector(".textarea.form-control", { visible: true });
    let ans = await tab.$$(".textarea.form-control");

    for (let i = 0; i < ans.length; i++) {
        if (i == 0) {
            await ans[i].type(data["hiringReason"]);
        } else if (i == 1) {
            await ans[i].type(data["availability"]);
        } else {
            await ans[i].type(data["rating"]);
        }
    }

    await tab.click(".submit_button_container");
}

main();


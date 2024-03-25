"use strict";

if (typeof browser == "undefined") {
  // `browser` is not defined in Chrome, but Manifest V3 extensions in Chrome
  // also support promises in the `chrome` namespace, like Firefox. To easily
  // test the example without modifications, polyfill "browser" to "chrome".
  globalThis.browser = chrome;
}

function convertTargets() {

  console.log('convertTargets');

  function GetTargetsData() {
    console.log('GetTargetsData');

    const speciesData = [];
    const sections = document.querySelectorAll('section[aria-labelledby]:not([aria-labelledby="hybrids"])');

    const queryParams = new URLSearchParams(window.location.search);
    const queryRegion = queryParams.get('r1');
    const queryBegMonth = queryParams.get('bmo');
    const queryEndMonth = queryParams.get('emo');

    sections.forEach((section) => {
      const category = section.getAttribute('aria-labelledby');
      const listItems = section.querySelectorAll('li');

      listItems.forEach((li) => {
        const name = li.querySelector('.SpecimenHeader').textContent.trim();
        const link = 'https://ebird.org' + li.querySelector('a').getAttribute('href');
        const frequencyTitle = li.querySelector('.ResultsStats-stats').title;
        const frequency = frequencyTitle.substring(0, frequencyTitle.indexOf('%')).trim();

        speciesData.push({
          name,
          frequency,
          link,
          category,
          queryRegion,
          queryBegMonth,
          queryEndMonth
        });
      });
    });

    return speciesData;
  }

  function ConvertToCSV(data) {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    data.forEach(item => {
      const values = headers.map(header => {
        const escaped = ('' + item[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
  function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
  }

  const targetsData = GetTargetsData();
  const csvData = ConvertToCSV(targetsData);
  const datetimeString = getCurrentDateTime();
  const filename = `targets-${datetimeString}.csv`;

  downloadCSV(csvData,filename);

}

document.getElementById('convertTargetsBtn').addEventListener('click', () => {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: convertTargets,
      injectImmediately: true,
    });
  });
});
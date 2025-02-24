"use strict";

if (typeof browser == "undefined") {
  // `browser` is not defined in Chrome, but Manifest V3 extensions in Chrome
  // also support promises in the `chrome` namespace, like Firefox. To easily
  // test the example without modifications, polyfill "browser" to "chrome".
  globalThis.browser = chrome;
}

function fallout() {
  function getTargetsData() {
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
        const mapUrl = 'https://ebird.org' + li.querySelector('.ResultsStats-action a').getAttribute('href');
        const frequencyTitle = li.querySelector('.ResultsStats-stats').title;
        const frequency = frequencyTitle.substring(0, frequencyTitle.indexOf('%')).trim();

        speciesData.push({
          name,
          frequency,
          link,
          mapUrl,
          category,
          queryRegion,
          queryBegMonth,
          queryEndMonth
        });
      });
    });

    return speciesData;
  }

  function getAlertsData() {
    // Find all observation containers
    const observationContainers = document.querySelectorAll('.Observation');
    const observationsData = [];

    // Iterate over each observation container
    observationContainers.forEach(container => {
      // Extract observation ID
      const observationId = container.id.split('-')[1];

      // Extract species name and scientific name
      const speciesName = container.querySelector('.Observation-species .Heading-main').textContent.trim();
      const scientificName = container.querySelector('.Observation-species .Heading-sub').textContent.trim();

      // Extract number observed
      const numberObservedText = container.querySelector('.Observation-numberObserved').textContent.trim();
      const numberObserved = numberObservedText.match(/\d+/) ? numberObservedText.match(/\d+/)[0] : 'Unknown';

      // Extract date
      const observationDate = container.querySelector('.Observation-meta a[title="Checklist"]').textContent.trim();

      // Extract and split location
      const locationLink = container.querySelector('.Observation-meta a[target="_blank"]');
      const fullLocation = locationLink ? locationLink.textContent.trim() : 'Unknown, Unknown, Unknown, Unknown';
      let [country, state, county, ...locationNameParts] = fullLocation.split(',').reverse().map(part => part.trim());
      const locationName = locationNameParts.reverse().join(','); // Join the remaining parts to form the location name
      const gpsCoordinates = locationLink ? locationLink.title.split(': ')[1] : 'Unknown, Unknown';
      const [latitude, longitude] = gpsCoordinates.split(',');

      // Extract observer's name
      const observerNameSpan = container.querySelector('.Observation-meta .GridFlex-cell span:not(.is-visuallyHidden)');
      const observerName = observerNameSpan ? observerNameSpan.textContent.trim() : 'Unknown';

      // Extract checklist URL
      const checklistLink = container.querySelector('.Observation-meta a[title="Checklist"]');
      const checklistUrl = checklistLink ? checklistLink.href : 'Unknown';

      // Extract confirmed tag
      const confirmedTagElement = container.querySelector('.Observation-tags strong');
      const confirmedTag = confirmedTagElement ? confirmedTagElement.textContent.trim() : 'Unknown';

      // Construct JSON object for the current observation
      const observationData = {
        observationId,
        speciesName,
        scientificName,
        numberObserved,
        observationDate,
        confirmedTag,
        locationName,
        county,
        state,
        country,
        observerName,
        latitude,
        longitude,
        checklistUrl
      };

      // Add the current observation's data to the array
      observationsData.push(observationData);
    });

    return observationsData;
  }

  function convertToCSV(data) {
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

  const datetimeString = getCurrentDateTime();
  let data;
  let filename;

  if (window.location.pathname == '/alert/summary') {
    console.log('Alerts page');
    data = getAlertsData();
    filename = `alerts-${datetimeString}.csv`;
  } else if (window.location.pathname == '/targets') {
    console.log('Targets page');
    data = getTargetsData();
    filename = `targets-${datetimeString}.csv`;
  } else {
    alert('This page is not supported');
    return;
  }
  const csvData = convertToCSV(data);
  downloadCSV(csvData, filename);
}

document.getElementById('falloutBtn').addEventListener('click', () => {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: fallout,
      injectImmediately: true,
    });
  });
});
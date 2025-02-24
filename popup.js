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

  function getRegionList() {
    const birdList = [];
    const url = new URL(window.location.href);
    const region = url.pathname.split('/')[2];

    const sections = document.querySelectorAll('.BirdList-list section');

    sections.forEach(section => {
      const sectionType = section.querySelector('h3').textContent.trim();
      const birdItems = section.querySelectorAll('.BirdList-list-list-item.countable');

      birdItems.forEach(item => {
        const speciesNameElement = item.querySelector('.Obs-species .Species-common');
        const speciesName = speciesNameElement ? speciesNameElement.textContent.trim() : '';
        const speciesLinkElement = item.querySelector('.Obs-species a');
        const speciesLink = speciesLinkElement ? speciesLinkElement.href : '';

        const countElement = item.querySelector('.Obs-count span[title]');
        const count = countElement ? countElement.textContent.trim() : '';

        const dateElement = item.querySelector('.Obs-date time');
        const date = dateElement ? dateElement.textContent.trim() : '';
        const dateLinkElement = item.querySelector('.Obs-date a');
        const dateLink = dateLinkElement ? dateLinkElement.href : '';

        const observerElement = item.querySelector('.Obs-observer a') || item.querySelector('.Obs-observer span');
        const observer = observerElement ? observerElement.textContent.trim() : '';

        const locationElement = item.querySelector('.Obs-location-name a') || item.querySelector('.Obs-location-name span');
        const location = locationElement ? locationElement.textContent.trim() : '';

        const sensitiveElement = item.querySelector('.Sensitive-badge');
        const sensitive = sensitiveElement ? true : false;

        birdList.push({
          region,
          sectionType,
          speciesName,
          speciesLink,
          count,
          date,
          dateLink,
          observer,
          location,
          sensitive
        });
      });
    });

    return birdList;
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
  const url = new URL(window.location.href);
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
  } else if (/^\/region\/.*\/bird-list$/.test(window.location.pathname)) {
    console.log('Region bird list page');

    let listMetric;
    switch (url.searchParams.get('rank')) {
      case 'lrec':
        listMetric = 'firstObserved';
        break;
      case 'hc':
        listMetric = 'highCount';
        break;
      default:
        listMetric = 'lastObserved';
        break;
    }
    
    let timePeriod;
    switch (url.searchParams.get('yr')) {
      case 'cur':
        timePeriod = new Date().getFullYear().toString();
        break;
      case 'curM':
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        timePeriod = `${year}${month}`;
        break;
      case null:
        timePeriod = 'allYears';
        break;
      default:
        timePeriod = url.searchParams.get('yr');
        break;
    }

    region = url.pathname.split('/')[2];

    console.log(`Region: ${region}, List metric: ${listMetric}, Time period: ${timePeriod}`);
    data = getRegionList();
    filename = `regionList-${region}-${listMetric}-${datetimeString}.csv`;
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
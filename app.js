const DEBUG = true;
function debug(...args) {
  if (DEBUG) {
    console.log('DEBUG: ', ...args);
  }
}

var csvData = [];
// Names for the CSV export
var csvFrom = '';
var csvTo = '';
var downloadButton = document.querySelector('.downloadCSV');

const API_KEY = 'ca9c7180-5c54-11ea-b53f-f99d1fc8d999';

var routeGroupsList = JSON.parse(localStorage.getItem('routeGroupsList')) || [];

/**
 * This function makes the call to the api and stores item
 * to the local storage and variabe
 * @param {string} originID port origin id
 * @param {string} destID port destination id
 */
function getDetails(originID, destID) {
  // https://apis.cargosmart.com/openapi/schedules/routeschedules?appKey=ca9c7180-5c54-11ea-b53f-f99d1fc8d999&porID=CNSHA&fndID=SGSIN

  const URL = `https://apis.cargosmart.com/openapi/schedules/routeschedules?appKey=${API_KEY}&porID=${originID}&fndID=${destID}`;

  debug('Calling the API');

  fetch(URL)
    .then((res) => {
      console.log('Server response: ', res);
      return res.json();
    })
    .then((res) => {
      debug('The JSON objects: ', res);
      // Only update with new data when there is something from the API!
      if (res.routeGroupsList.length) {
        routeGroupsList = res.routeGroupsList;
        localStorage.setItem(
          'routeGroupsList',
          JSON.stringify(routeGroupsList)
        );
        // Update the DOM with the new results
        populateResults();
      } else {
        debug('Nothing returned from the API :(');
        // Do something, like show an error message to the user.
      }
    })
    .catch((err) => debug(err));
}

/**
 * Updates the DOM with a table with all the items from the API
 *
 */
function populateResults() {
  if (!routeGroupsList.length) return;
  let count = 0;
  // Create a new CSV data file
  csvData = [];
  var output = `
  <table class="data-table">
  <tr>
  <th>#</th>
  <th>Carrier</th>
  <th>Departure</th>
  <th>Arrival</th>
  <th>Service/Vessel</th>
  <th>Transit Time</th>
  </tr> 
 `;
  // Run through each of the groups
  routeGroupsList.forEach((group, index) => {
    // Now run through each of the items in the group

    group.route.forEach((item) => {
      count++;

      let carrier = group.carrier.name;
      let { transitTime } = item;
      let departure = item.por.location.name;
      let depDate = item.por.etd;
      let arrival = item.fnd.location.name;
      let arvDate = item.fnd.eta;
      let code, name;

      if (item.leg[0].service) {
        code = item.leg[0].service.code;
        name = item.leg[0].service.name;
      }

      output += `
      <tr>
      <td>${count}</td>
      <td>${carrier}</td>
      <td>
        <div>${departure}</div>
        <small>${moment(depDate).format('D MMM, YYYY (ddd)')}</small>
      </td>
      <td>
        <div>${arrival}</div>
        <small>${moment(arvDate).format('D MMM, YYYY (ddd)')}</small>
      </td>
      <td>
        <div>${code ? code : ''}</div>
        <small>${name ? name : ''}</small></td>
      <td>${transitTime} days</td>
      </tr>
      `;

      transitTime += ' days';

      csvData.push([carrier, departure, arrival, code, transitTime]);
    });
  });

  output += `</table>`;

  document.querySelector('.count').innerText = `Total ${count} results`;
  document.querySelector('.results').innerHTML = output;
  downloadCSV(csvData);
}

/**
 * This function will handle form submit and then call getDetails
 * to get the cargo information
 * @param {object} e Event object
 */
function onSubmit(e) {
  e.preventDefault();
  let originID, destID;
  originID = e.target.origin.value;
  destID = e.target.destination.value;

  if (!originID || !destID) return;
  getDetails(originID, destID);

  e.target.reset();
}

function downloadCSV(data) {
  var csv = 'Carrier,Departure,Arrival,Service/Vessel,Transit Time\n';
  data.forEach((item) => {
    csv += item.join(',');
    csv += '\n';
  });

  // var hiddenElement = document.createElement('a');
  downloadButton.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  downloadButton.target = '_blank';
  downloadButton.download = 'cargo_details.csv';
  // hiddenElement.click();
}

const form = document.querySelector('.form');
form.addEventListener('submit', onSubmit);

const resultsDiv = document.querySelector('.results');

window.addEventListener('DOMContentLoaded', populateResults);

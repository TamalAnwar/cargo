var csvData = [];
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

  console.log('Calling the API');

  fetch(URL)
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((res) => {
      console.log(res);
      routeGroupsList = res.routeGroupsList;
      localStorage.setItem('routeGroupsList', JSON.stringify(routeGroupsList));
      if (routeGroupsList.length) {
        console.log('Items are added! ', routeGroupsList.length);
        populateResults();
      }
    })
    .catch((err) => console.log(err));
}

function populateResults() {
  if (!routeGroupsList.length) return;
  var output = '';
  routeGroupsList.forEach((item, index) => {
    let carrier = item.carrier.name;
    let departure = item.por.location.name;
    let arrival = item.fnd.location.name;
    let code, name;

    if (item.route[0].leg[0].service) {
      code = item.route[0].leg[0].service.code;
      name = item.route[0].leg[0].service.name;
    } else {
      code = 'N/A';
      name = 'N/A';
    }

    output += `
    <p>
    <span>${carrier}</span>
    <span>${departure}</span>
    <span>${arrival}</span>
    <span>${code}</span>
    </p>
    `;
    csvData = [];
    csvData.push([carrier, departure, arrival, code]);
  });

  document.querySelector('.results').innerHTML = output;
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
}

function downloadCSV(data) {
  var csv = 'Carrier,Departure,Arrival,Service/Vessel\n';
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

populateResults();

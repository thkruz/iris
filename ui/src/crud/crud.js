import config from './../config';
const ApiUrl = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

export const CRUDdataTable = ({ method, path, data }) => {
  //methods: POST, PATCH
  const id = data.id ? data.id : '';
  const baseURL = `${ApiUrl}/data/`;
  fetch(`${baseURL}${path}?id=${id}`, {
    method: method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (response.ok) {
      return response;
    } else {
      throw new Error('Cannot convert response to json');
    }
  });
};

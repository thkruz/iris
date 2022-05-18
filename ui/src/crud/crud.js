export const CRUDdataTable = ({ method, path, data }) => {
    //methods: POST, PATCH
    const id = data.id ? data.id : '';
    delete(data['id']);
    const baseURL = 'http://localhost:3000/data/';
    fetch(`${baseURL}${path}?id=${id}`, {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Cannot convert response to json');
        };
    });
};
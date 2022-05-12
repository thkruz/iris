import { useState, useEffect } from 'react';

const baseUrl = 'http://localhost:8080/'; // May need to change this in production

export const useFetch = (urlRoute) => {
  const [data, setData] = useState([]);
  const [err, setErr] = useState(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
      fetch(baseUrl + urlRoute)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Cannot convert response to json');
        }
      })
      .then(json => {
        setData(json)
      })
      .catch(e => setErr(e))
      .finally(() => setLoad(false));
    }, [urlRoute]);

  return { data, err, load };
};
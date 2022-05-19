import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
const userContext = React.createContext();
const updateUserContext = React.createContext();

const url = config[process.env.REACT_APP_NODE_ENV || 'development'].apiUrl;

const defaultUserContext = { server_id: 1, team_id: 1};

export const useUser = () => {
  return useContext(userContext);
};

export const useUpdateUser = () => {
  return useContext(updateUserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUserContext);
  window.sewApp.socket.on('updateUserClient', (data) => {
      console.log('updateUserClient', data);
      if (data.user != window.sewApp.socket.id) {
          console.log('actually updating the User');
          setUser(data.signals);
      }
  });

  const updateUser = (update) => {
      console.log('updateUser', update);
      // send patch request to server
      axios.patch(`${url}/data/player/${user.id}`, update)
          .then(res => {
            if(res.status === 200) {
              window.sewApp.socket.emit('updateUser', { user: window.sewApp.socket.id, signals: update });
              setUser(update);
            }
            else {
              console.log('error patching user');
              window.alert("Error patching user");
            }
          })
          .catch(err => {
            console.log("Error patching user", err);
          }
      );
  };

  return (
      <userContext.Provider value={user}>
          <updateUserContext.Provider value={updateUser}>
              {children}
          </updateUserContext.Provider>
      </userContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.any,
};

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
const userContext = React.createContext();
const updateUserContext = React.createContext();

const defaultUserContext = [
  { server: 1, team: 1},
];

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
      // patch request to update database
      // if patch request is good
      window.sewApp.socket.emit('updateUser', { user: window.sewApp.socket.id, signals: update });
      setUser(update);
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

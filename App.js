import React from 'react';
import { StyleSheet, View, Button, StatusBar } from 'react-native';
import { Router, Scene } from 'react-native-router-flux';
import { Provider } from 'react-redux';

import Main from './components/Main'
import createStore from './store/createStore';

const store = createStore();

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Main />
      </Provider>
    );
  }
  componentWillMount() {
    StatusBar.setHidden(true);
  }
}

import React from 'react';
import { StyleSheet, View, Text, Button, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { Router, Scene } from 'react-native-router-flux';

import Menu from './Menu';
import CreateRide from './CreateRide';
import QuoteGenerator from './QuoteGenerator';

class Main extends React.Component {
  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="menu"
            component={Menu}
            title="Menu"
            hideNavBar={true}
          />
          <Scene key="createRide"
            component={CreateRide}
            hideNavBar={true}
            initial
          />
          <Scene
            key="quoteGenerator"
            component={QuoteGenerator}
          />
        </Scene>
      </Router>
    );
  }
  componentWillMount() {
    StatusBar.setHidden(true);
  }
}

export default Main;
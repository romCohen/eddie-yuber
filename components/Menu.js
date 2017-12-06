import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { Actions } from "react-native-router-flux";
import { auth } from '../modules'
import { connect } from 'react-redux';

const showCreateRide = () => {
  Actions.createRide();
};
const showQuoteGenerator = () => {
  Actions.quoteGenerator();
};
class Menu extends React.Component {
  render() {
    const { requestPushToken } = this.props
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text h1>App</Text>
        </View>
        <Button large buttonStyle={styles.button} title="Page 1"  onPress={showCreateRide}/>
        <Button large buttonStyle={styles.button} title="Ride"  onPress={showQuoteGenerator}/>
        <Button large buttonStyle={styles.button} title="Push Token"  onPress={requestPushToken}/>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    quote: state.quote,
    auth: state.auth
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    requestPushToken : () => dispatch(auth.actions.requestPushToken())
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'white'
  },
  button: {
    margin: 10
  },
  header: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
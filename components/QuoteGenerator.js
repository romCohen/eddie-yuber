import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { quote } from '../modules';

class QuoteGenerator extends React.Component {
  render() {
    const { requestQuote } = this.props;
    return (
      <View style={styles.container}>
        <Button large style={styles.button} title="Request Quote" onPress={requestQuote} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    textAlign: 'center'
  },
  button: {
    margin: 10
  }
});

const mapStateToProps = (state) => {
  return {
    quote: state.quote
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    requestQuote : () => dispatch(quote.actions.requestQuote({
      pickupLocation: {
        lat: 40.755610,
        lon: -73.954347,
      },
      dropoffLocation: {
        lat: 40.755410,
        lon: -73.954947,
      },
      pickupDatetime: Date.now()
    }))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuoteGenerator);
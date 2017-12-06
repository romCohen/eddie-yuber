import React from 'react';
import { StyleSheet, Dimensions, Text, View, Button } from 'react-native';
import { ListItem, List } from 'react-native-elements'
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { connect } from 'react-redux';
import { quote } from '../modules';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;


class CreateRide extends React.Component {
  mapPressed(e) {
    const { coordinate, position } = e.nativeEvent
    const { latitude, longitude } = coordinate

    if (!this.props.quote.pickupLocation) {
      return this.props.setPickupLocation({ latitude, longitude })
    }

    if (!this.props.quote.dropoffLocation) {
      this.props.setDropoffLocation({ latitude, longitude })
      return this.props.requestQuote()
    }
  }

  confirmQuoteType(quoteId, vehicleType) {
    this.props.selectQuote(quoteId, vehicleType);
  }

  render() {
    const { quote, quoteEntities } = this.props;

    let pickupMarker = null;
    if (quote.pickupLocation) {
      pickupMarker = <MapView.Marker coordinate={quote.pickupLocation}/>
    }

    let dropoffMarker = null;
    if (quote.dropoffLocation) {
      dropoffMarker = <MapView.Marker coordinate={quote.dropoffLocation}/>
    }
    
    let confirmQuote = null;
    const quotes = Object.entries(quoteEntities);
    if (quotes.length > 0) {
      const { dropoffLocation, id, pickupDatetime, pickupLocation, quote, riderId } = quotes[0][1]
      confirmQuote = 
        (<View style={styles.menuContainer}>
          <List>
            <ListItem 
              title={`Double Necker $${quote.doubleNecker}`} 
              leftIcon={{name: 'van-utility', type: 'material-community'}}
              onPress={() => this.confirmQuoteType(id, 'double-necker')}
            />
            <ListItem 
              title={`Kramer $${quote.kramer}`} 
              leftIcon={{name: 'car-estate', type: 'material-community'}}
              onPress={() => this.confirmQuoteType(id, 'double-necker')}
            />
            <ListItem 
              title={`Ukelele $${quote.ukelele}`} 
              leftIcon={{name: 'car-pickup', type: 'material-community'}}
              onPress={() => this.confirmQuoteType(id, 'double-necker')}
            />
          </List>
        </View>)
    }

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          onPress={(e) => this.mapPressed(e)}
          region={{
            latitude: quote.defaultLocation.latitude,
            longitude: quote.defaultLocation.longitude,
            latitudeDelta: 0.6,
            longitudeDelta: ASPECT_RATIO * 0.6,
          }}>
            {pickupMarker}
            {dropoffMarker}
          </MapView>
          { confirmQuote }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20
  }
});

const mapDispatchToProps = (dispatch) => {
  return {
    setPickupLocation : (coordinate) => dispatch(quote.actions.setPickupLocation({ coordinate })),
    setDropoffLocation : (coordinate) => dispatch(quote.actions.setDropoffLocation({ coordinate })),
    requestQuote: () => dispatch(quote.actions.requestQuote()),
    selectQuote: (quoteId, vehicleType) => dispatch(quote.actions.selectQuote({quoteId, vehicleType}))
  }
}

const mapStateToProps = (state) => {
  return {
    quote: state.quote,
    quoteEntities: state.entities.quote
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRide);
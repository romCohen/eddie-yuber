##
## ENV SETUP
##
import falcon
import json
import numpy as np
import datetime
import time
import requests
from jsonschema import validate, ValidationError
import msgpack
from geopy.geocoders import Nominatim
from eddie.db_client import *
from eddie.middleware import AuthMiddleware
from eddie.hooks import api_key, log_operation
import rethinkdb as rdb
import hashlib

##
## DECLARE API INSTANCE
##
api = falcon.API(
    middleware= AuthMiddleware()
)


##
## GLOBAL VARIABLES
##
global BASE_RATE, MAX_SURGE_MULTIPLIER, GOOGLE_API_KEY, DISTANCE_RATE, TIME_RATE, SERVICE_FEE
BASE_RATE = {
    "ukelele": 1,
    "kramer": 2,
    "double-necker": 3
}
SERVICE_FEE = {
    "ukelele": 0.5,
    "kramer": 1.5,
    "double-necker": 3
}
DISTANCE_RATE = {
    "ukelele": 0.97,
    "kramer": 1.68,
    "double-necker": 2.17
}
TIME_RATE = {
    "ukelele": 0.14,
    "kramer": 0.26,
    "double-necker": 0.33
}
MAX_SURGE_MULTIPLIER = 3.0
GOOGLE_API_KEY = "AIzaSyCFGqwa2qfRcViW6f0c88AK-_VmOC5imeA"



##
## GLOBAL HELPERS
##
def logisticMap(x:float, alpha: (int, float)) -> float:
	return(1/(1 + np.e**(-alpha*x)))

def getReQLNow():
    timezone = time.strftime("%z")
    reql_tz = rdb.make_timezone(timezone[:3] + ":" + timezone[3:])
    now = datetime.datetime.now(reql_tz)
    return(now)




##
## Quote Resource
##
class QuoteResource(object):

    @property
    def __post_request_schema(self):
        return(
            {
                "type": "object",
                "properties": {
                    "rider_id": {"type": "string"},
                    "pickup_location": {
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number"},
                            "long": {"type": "number"}
                        }
                    },
                    "dropoff_location": {
                        "type": "object",
                        "properties": {
                            "lat": {"type": "number"},
                            "long": {"type": "number"}
                        },
                        "pickup_datetime": {"type": "string"}
                    }
                }
            }
        )

    def getSurgeMultiplier(self, origin):
        """
        This method returns the Demand-Supply Ratio in origin's zipcode.


        :return:
        """
        # Get current location
        geolocator = Nominatim()
        location = geolocator.geocode(origin)

        # ...

        # Determine Demand-Supply ratio
        demand_count = 54
        supply_count = 35

        # Compute multiplier
        return(
            min(max(1, demand_count / supply_count), MAX_SURGE_MULTIPLIER)
        )

    def quoteTrip(self, origin: str, destination: str):
        # Submit request to Google Maps API
        payload = {
            "units": "imperial",
            "origins": origin,
            "destinations": destination,
            "key": GOOGLE_API_KEY
        }
        r = requests.get("https://maps.googleapis.com/maps/api/distancematrix/json?", params=payload)

        # Create response instance
        response = {
            "ukelele": 0,
            "kramer": 0,
            "double-necker": 0
        }
        if r.json()["status"] == "OK":
            # Get surge multiplier
            surge_multiplier = self.getSurgeMultiplier(origin=origin)

            # Process distance (miles)
            distance = round(r.json()["rows"][0]["elements"][0]["distance"]["value"]/1609.34, 1)

            # Process duration (minutes)
            duration = int(round(r.json()["rows"][0]["elements"][0]["duration"]["value"]/60, 0))

            # Compute aggregate quote
            for van_type in response:
                response[van_type] += BASE_RATE[van_type]
                response[van_type] += SERVICE_FEE[van_type]
                response[van_type] += DISTANCE_RATE[van_type] * distance
                response[van_type] += TIME_RATE[van_type] * duration
                response[van_type] *= surge_multiplier
                response[van_type] = round(response[van_type], 2)

        return(response)

    @falcon.before(api_key)
    @falcon.after(log_operation)
    def on_post(self, req, resp):
        """

        :param req:
        :param resp:
        :return:
        """
        try:
            raw_json = req.stream.read()
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   'Error',
                                   ex.message)

        try:
            result_json = json.loads(raw_json, encoding='utf-8')
        except ValueError:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Malformed JSON',
                'Could not decode the request body. The '
                'JSON was incorrect.'
            )

        # Validate request
        try:
            validate(result_json, self.__post_request_schema)
        except ValidationError as e:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Request Format Error',
                e.message
            )


        # Process request
        try:
            quote = self.quoteTrip(
                origin="{},{}".format(
                    result_json["pickup_location"]["lat"],
                    result_json["pickup_location"]["long"]
                ),
                destination="{},{}".format(
                    result_json["dropoff_location"]["lat"],
                    result_json["dropoff_location"]["long"]
                )
            )
        except:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Error in Quote',
                'Unable to process quote at the moment.'
            )

        # Add quote to DB
        quote_response = result_json.copy()
        quote_response['quote'] = quote
        quote_response['created'] = getReQLNow()
        rdb_response = rdb.db(PROJECT_DB).table('quotes').insert(
            quote_response
        ).run(rdb_conn)
        quote_response['id'] = rdb_response['generated_keys'][0]


        # Create response object
        # quote_response['created'] = str(quote_response['created'])
        print(quote_response)
        resp.data = msgpack.packb(
            json.dumps(quote_response, ensure_ascii=False, default = lambda x: x.__str__() if isinstance(x, datetime.datetime) else x),
            use_bin_type=True
        )
        resp.content_type = falcon.MEDIA_MSGPACK
        resp.status = falcon.HTTP_202



##
## Rider Resource
##
class RiderResource(object):

    @property
    def __post_request_schema(self):
        return (
            {
                "type": "object",
                "properties": {
                    "username": {"type": "string"},
                    "email": {"type": "string"},
                    "password": {"type": "string"}
                }
            }
        )

    def on_post(self, req, resp):
        try:
            raw_json = req.stream.read()
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   'Error',
                                   ex.message)

        try:
            result_json = json.loads(raw_json, encoding='utf-8')
        except ValueError:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Malformed JSON',
                'Could not decode the request body. The '
                'JSON was incorrect.'
            )

        # Validate request
        try:
            validate(result_json, self.__post_request_schema)
        except ValidationError as e:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Request Format Error',
                e.message
            )

        # Insert user in database

        rdb_response = rdb.db(PROJECT_DB).table('quotes').insert(
            {
                "email": result_json['email'],
                "pwd": hashlib.sha256(str.encode(result_json['password'])).hexdigest(),
                "username": result_json['username']
            }
        ).run(rdb_conn)



        resp.status = falcon.HTTP_201 # created

    def on_delete(self, req, resp):
        """
        Handle user deletion.
        :param req:
        :param resp:
        :return:
        """
        rdb.db(PROJECT_DB).table('riders').get().delete().run(rdb_conn)
        resp.status = falcon.HTTP_202

    def on_get(self, req, resp):
        pass




##
## Trip Resource
##
class TripResource(object):

    @property
    def __post_request_schema(self):
        return (
            {
                "type": "object",
                "properties": {
                    "username": {"type": "string"},
                    "email": {"type": "string"},
                    "password": {"type": "string"}
                }
            }
        )

    def on_post(self, req, resp):
        try:
            raw_json = req.stream.read()
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   'Error',
                                   ex.message)

        try:
            result_json = json.loads(raw_json, encoding='utf-8')
        except ValueError:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Malformed JSON',
                'Could not decode the request body. The '
                'JSON was incorrect.'
            )

        # Validate request
        try:
            validate(result_json, self.__post_request_schema)
        except ValidationError as e:
            raise falcon.HTTPError(
                falcon.HTTP_400,
                'Request Format Error',
                e.message
            )

        # Insert user in database

        rdb_response = rdb.db(PROJECT_DB).table('quotes').insert(
            {
                "email": result_json['email'],
                "pwd": hashlib.sha256(str.encode(result_json['password'])).hexdigest(),
                "username": result_json['username']
            }
        ).run(rdb_conn)



        resp.status = falcon.HTTP_201 # created



api.add_route('/quote', QuoteResource())
api.add_route('/rider', RiderResource())
api.add_route('/trip', TripResource())












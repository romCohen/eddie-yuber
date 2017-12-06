import falcon
from falcon import testing
import msgpack
import pytest

from eddie.app import api


@pytest.fixture
def client():
    return testing.TestClient(api)
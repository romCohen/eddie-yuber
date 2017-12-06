import rethinkdb as rdb
from rethinkdb.errors import RqlRuntimeError, RqlDriverError


RDB_HOST = 'localhost'
RDB_PORT = 28015

# Database and table
global PROJECT_DB, PROJECT_TABLES
PROJECT_DB = 'eddie'
PROJECT_TABLES = [
    'riders',
    'quotes',
    'drivers',
    'trips'
]

# Set up db connection client
rdb_conn = rdb.connect(
	host=RDB_HOST,
	port=RDB_PORT
)

# Function is for cross-checking database and tables exist
def dbSetup():
    print("here")
    try:
        rdb.db_create(PROJECT_DB).run(rdb_conn)
        print('Database setup completed.')
    except RqlRuntimeError:
        print("{} database exists.".format(PROJECT_DB))
        for table in PROJECT_TABLES:
            try:
                rdb.db(PROJECT_DB).table_create(table).run(rdb_conn)
                print('Table <{}> creation completed'.format(table))
            except:
                print('Table <{}> already exists.'.format(table))

dbSetup()
# fetch_stars_test.py
from astroquery.simbad import Simbad
result = Simbad.query_tap("SELECT TOP 5 main_id, ra, dec FROM basic WHERE ra IS NOT NULL")
print(result)
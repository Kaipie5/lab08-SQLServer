DROP TABLE city_explorer;
CREATE TABLE IF NOT EXISTS
city_explorer(
  id SERIAL PRIMARY KEY NOT NULL,
  city_name VARCHAR(256) NOT NULL,
  formatted_query VARCHAR(256) NOT NULL,
  latitude INTEGER NOT NULL,
  longitude INTEGER NOT NULL
);
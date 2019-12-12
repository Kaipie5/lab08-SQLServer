DROP TABLE city_explorer;
CREATE TABLE IF NOT EXISTS
city_explorer(
  id SERIAL PRIMARY KEY NOT NULL,
  city_name VARCHAR(256) NOT NULL,
  formatted_query VARCHAR(256) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL
);

-- INSERT INTO city_explorer (city_name, formatted_query, latitude, longitude) VALUES ('seattle', 'seattle', '47', '-122');
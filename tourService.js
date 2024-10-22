// tourService.js
const { getConnection } = require('./db');

// Function to get all tours
const getTours = (callback) => {
  const connection = getConnection();
  const query = 'SELECT * FROM Tour';
  connection.query(query, callback);
};

// Function to add a new tour
const addTour = (tourData, callback) => {
  const connection = getConnection();
  const query = 'INSERT INTO Tour (tour_name, tour_date, description) VALUES (?, ?, ?)';
  connection.query(query, [tourData.tour_name, tourData.tour_date, tourData.description], callback);
};

// Function to update a tour
const updateTour = (tourData, callback) => {
  const connection = getConnection();
  const query = 'UPDATE Tour SET tour_name = ?, tour_date = ?, description = ? WHERE tour_id = ?';
  connection.query(query, [tourData.tour_name, tourData.tour_date, tourData.description, tourData.tour_id], callback);
};

// Function to delete a tour
const deleteTour = (tour_id, callback) => {
  const connection = getConnection();
  const query = 'DELETE FROM Tour WHERE tour_id = ?';
  connection.query(query, [tour_id], callback);
};

module.exports = { getTours, addTour, updateTour, deleteTour };

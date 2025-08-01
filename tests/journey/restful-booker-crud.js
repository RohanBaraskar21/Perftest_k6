
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';


const BASE_URL = 'https://restful-booker.herokuapp.com';

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function randomBooking() {
  const firstNames = ['Jim', 'Sally', 'John', 'Alice', 'Bob', 'Jane', 'Emma', 'Liam', 'Olivia', 'Noah'];
  const lastNames = ['Brown', 'Smith', 'Doe', 'Taylor', 'Lee', 'Patel', 'Johnson', 'Williams', 'Jones', 'Garcia'];
  const needs = ['Breakfast', 'Late Checkout', 'None', 'Extra Pillow', 'Parking'];
  const firstname = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastname = lastNames[Math.floor(Math.random() * lastNames.length)];
  const totalprice = Math.floor(Math.random() * 500) + 50;
  const depositpaid = Math.random() < 0.5;
  // Generate checkin/checkout dates in August 2025
  const checkin = randomDate(new Date(2025, 7, 1), new Date(2025, 7, 15));
  const checkout = randomDate(new Date(2025, 7, 16), new Date(2025, 7, 28));
  const additionalneeds = needs[Math.floor(Math.random() * needs.length)];
  return {
    firstname,
    lastname,
    totalprice,
    depositpaid,
    bookingdates: { checkin, checkout },
    additionalneeds,
  };
}

const responseTime = new Trend('restful_booker_response_time');

export let options = {
  vus: 1,
  duration: '10s',  // Increased duration to accommodate think time
  thresholds: {
    restful_booker_response_time: ['p(95)<1000'],
  },
  tags: { test_type: 'journey', api: 'restful-booker' },
};

export default function () {
  const booking = randomBooking();
  let token = '';
  let bookingId = null;

  group('Authenticate', function () {
    const res = http.post(`${BASE_URL}/auth`, JSON.stringify({ username: 'admin', password: 'password123' }), { headers: { 'Content-Type': 'application/json' } });
    responseTime.add(res.timings.duration);
    check(res, { 'auth status 200': (r) => r.status === 200 });
    token = res.json('token');
  });

  group('Create Booking', function () {
    const res = http.post(`${BASE_URL}/booking`, JSON.stringify(booking), { headers: { 'Content-Type': 'application/json' } });
    responseTime.add(res.timings.duration);
    check(res, { 'create status 200': (r) => r.status === 200 });
    bookingId = res.json('bookingid');
    console.log('Created booking with ID:', bookingId);
    // Add think time after creation
    sleep(2);
  });

  group('Get Booking', function () {
    const res = http.get(`${BASE_URL}/booking/${bookingId}`);
    responseTime.add(res.timings.duration);
    check(res, { 'get status 200': (r) => r.status === 200 });
  });

  group('Update Booking', function () {
    const updated = { ...booking, firstname: booking.firstname + '_upd' };
    const res = http.put(`${BASE_URL}/booking/${bookingId}`, JSON.stringify(updated), {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `token=${token}`,
      },
    });
    responseTime.add(res.timings.duration);
    check(res, { 'update status 200': (r) => r.status === 200 });
  });

  group('Delete Booking', function () {
    const res = http.del(`${BASE_URL}/booking/${bookingId}`, null, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    responseTime.add(res.timings.duration);
    check(res, { 'delete status 201': (r) => r.status === 201 });
  });

  sleep(1);
}

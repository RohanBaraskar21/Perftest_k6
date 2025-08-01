import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = 'https://petstore3.swagger.io/api/v3';
const responseTime = new Trend('petstore_response_time');

// Random data generators
function randomPet() {
  const names = ['Buddy', 'Max', 'Charlie', 'Luna', 'Bella', 'Rocky', 'Daisy', 'Milo'];
  const categories = ['dog', 'cat', 'bird', 'fish'];
  const statuses = ['available', 'pending', 'sold'];
  
  return {
    id: Math.floor(Math.random() * 100000),
    name: names[Math.floor(Math.random() * names.length)],
    category: {
      id: Math.floor(Math.random() * 4) + 1,
      name: categories[Math.floor(Math.random() * categories.length)]
    },
    photoUrls: ['https://example.com/pet.jpg'],
    tags: [
      {
        id: Math.floor(Math.random() * 5) + 1,
        name: 'tag' + Math.floor(Math.random() * 3)
      }
    ],
    status: statuses[Math.floor(Math.random() * statuses.length)]
  };
}

function randomUser() {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'Alex', 'Emma'];
  const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Wilson'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    id: Math.floor(Math.random() * 100000),
    username: firstName.toLowerCase() + Math.floor(Math.random() * 1000),
    firstName: firstName,
    lastName: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    password: 'Password123!',
    phone: '+1234567890',
    userStatus: 1
  };
}

function randomOrder() {
  return {
    id: Math.floor(Math.random() * 100000),
    petId: Math.floor(Math.random() * 100000),
    quantity: Math.floor(Math.random() * 5) + 1,
    shipDate: new Date().toISOString(),
    status: 'placed',
    complete: true
  };
}

export function petStoreJourney() {
  const user = randomUser();
  const pet = randomPet();
  const order = randomOrder();
  let userCreated = false;
  let petCreated = false;
  let orderId = null;

  group('Create User', function () {
    const res = http.post(
      `${BASE_URL}/user`,
      JSON.stringify(user),
      { headers: { 'Content-Type': 'application/json' } }
    );
    responseTime.add(res.timings.duration);
    userCreated = check(res, { 'create user status 200': (r) => r.status === 200 });
    console.log(`User creation response: ${res.status} ${res.body}`);
    // Add think time after user creation
    sleep(2);
  });

  group('Login User', function () {
    if (userCreated) {
      const res = http.get(
        `${BASE_URL}/user/login?username=${user.username}&password=${user.password}`
      );
      responseTime.add(res.timings.duration);
      check(res, { 'login status 200': (r) => r.status === 200 });
      console.log(`Login response: ${res.status} ${res.body}`);
      // Add think time after login
      sleep(1);
    }
  });

  group('Create Pet', function () {
    const res = http.post(
      `${BASE_URL}/pet`,
      JSON.stringify(pet),
      { headers: { 'Content-Type': 'application/json' } }
    );
    responseTime.add(res.timings.duration);
    petCreated = check(res, { 'create pet status 200': (r) => r.status === 200 });
    console.log(`Pet creation response: ${res.status} ${res.body}`);
    // Add think time after pet creation
    sleep(2);
  });

  group('Find Pet by Status', function () {
    if (petCreated) {
      const res = http.get(`${BASE_URL}/pet/findByStatus?status=${pet.status}`);
      responseTime.add(res.timings.duration);
      check(res, { 'find pet status 200': (r) => r.status === 200 });
      console.log(`Find pet response: ${res.status}`);
      // Add think time after pet search
      sleep(1);
    }
  });

  group('Create Order', function () {
    if (petCreated) {
      order.petId = pet.id;
      const res = http.post(
        `${BASE_URL}/store/order`,
        JSON.stringify(order),
        { headers: { 'Content-Type': 'application/json' } }
      );
      responseTime.add(res.timings.duration);
      const success = check(res, { 'create order status 200': (r) => r.status === 200 });
      if (success) {
        orderId = order.id;
      }
      console.log(`Order creation response: ${res.status} ${res.body}`);
      // Add think time after order creation
      sleep(2);
    }
  });

  group('Get Order', function () {
    if (orderId) {
      const res = http.get(`${BASE_URL}/store/order/${orderId}`);
      responseTime.add(res.timings.duration);
      check(res, { 'get order status 200': (r) => r.status === 200 });
      console.log(`Get order response: ${res.status} ${res.body}`);
      // Add think time after getting order
      sleep(1);
    }
  });

  group('Delete Order', function () {
    if (orderId) {
      const res = http.del(`${BASE_URL}/store/order/${orderId}`);
      responseTime.add(res.timings.duration);
      check(res, { 'delete order status 200': (r) => r.status === 200 });
      console.log(`Delete order response: ${res.status} ${res.body}`);
      // Add think time after order deletion
      sleep(1);
    }
  });

  group('Delete Pet', function () {
    if (petCreated) {
      const res = http.del(`${BASE_URL}/pet/${pet.id}`);
      responseTime.add(res.timings.duration);
      check(res, { 'delete pet status 200': (r) => r.status === 200 });
      console.log(`Delete pet response: ${res.status} ${res.body}`);
      // Add think time after pet deletion
      sleep(1);
    }
  });

  group('Delete User', function () {
    if (userCreated) {
      const res = http.del(`${BASE_URL}/user/${user.username}`);
      responseTime.add(res.timings.duration);
      check(res, { 'delete user status 200': (r) => r.status === 200 });
      console.log(`Delete user response: ${res.status} ${res.body}`);
    }
  });

  // Final think time before next iteration
  sleep(1);
}

import {faker} from '@faker-js/faker';
import {expect} from 'chai';
import {PrismaClient} from '@prisma/client';
import request from 'supertest';
import server from '../index';
const prisma = new PrismaClient();

const testUser = {
  email: faker.internet.email().toLocaleLowerCase(),
  address: faker.address.streetAddress(),
  city: faker.address.city(),
  state: faker.address.state(),
  zip: faker.address.zipCode(),
  billing_name: faker.name.fullName(),
  billing_address: faker.address.secondaryAddress(),
  billing_city: faker.address.city(),
  billing_state: faker.address.state(),
  billing_zip: faker.address.zipCode(),
  work_phone: faker.phone.imei(),
  home_phone: faker.phone.imei(),
  mobile_phone: faker.phone.imei(),
};

const updateUser = {
  address: faker.address.streetAddress(),
  city: faker.address.city(),
  state: faker.address.state(),
  zip: faker.address.zipCode(),
  billing_name: faker.name.fullName(),
  billing_address: faker.address.secondaryAddress(),
  billing_city: faker.address.city(),
  billing_state: faker.address.state(),
  billing_zip: faker.address.zipCode(),
  work_phone: faker.phone.imei(),
  home_phone: faker.phone.imei(),
  mobile_phone: faker.phone.imei(),
};

/**
 *  Note: We should use different table for test
 *
 */
describe('User Endpoint Unit tests', () => {
  it(`Create new test user ${testUser.email}`, async () => {
    const res = await request(server)
      .post('/users')
      .send({
        ...testUser,
      });
    expect(res).to.have.property('status', 200);
    expect(res.headers['content-type']).to.equal(
      'application/json; charset=utf-8'
    );
    expect(res.body).to.have.property('email', testUser.email);
  });

  it(`Error on existing User  `, async () => {
    const singleUser = await prisma.users.findFirst({
      where: {
        id: {
          gt: 1,
        },
      },
    });
    const res = await request(server)
      .post('/users')
      .send({
        ...singleUser,
      })
      .set('Accept', 'application/json; charset=utf-8');

    expect(res).to.have.property('status', 400);
    expect(res.headers['content-type']).to.equal(
      'application/json; charset=utf-8'
    );
  });

  it(`Find  user by email  ${testUser.email}`, async () => {
    const res = await request(server)
      .get(`/users/email/${testUser.email}`)
      .set('Accept', 'application/json; charset=utf-8');

    expect(res).to.have.property('status', 200);
    expect(res.headers['content-type']).to.equal(
      'application/json; charset=utf-8'
    );
    expect(res.body).to.have.property('email', testUser.email);
  });

  it(`Update user by ID  1`, async () => {
    const res = await request(server)
      .put(`/users`)
      .send({
        ...updateUser,
        id: 1,
      })
      .set('Accept', 'application/json; charset=utf-8');

    expect(res).to.have.property('status', 200);
    expect(res.headers['content-type']).to.equal(
      'application/json; charset=utf-8'
    );
    expect(res.body).to.have.property('address', updateUser.address);
  });

  it(`Update by multiple users by [id]`, async () => {
    const multipleUsers = await prisma.users.findMany({});

    const res = await request(server)
      .put(`/users/update`)
      .send({
        users: [
          {
            ...multipleUsers[0],
            address: 'new address',
          },
          {
            ...multipleUsers[1],
            address: 'new address 2',
          },
        ],
      });

    expect(res).to.have.property('status', 200);
    expect(res.headers['content-type']).to.equal(
      'application/json; charset=utf-8'
    );
  });

  it(`Delete by multiple  array of ids  []`, async () => {
    const multipleUsers = await prisma.users.findMany({
      where: {
        id: {
          gt: 1,
        },
      },
    });
    const myArray = multipleUsers.map((u) => u.id);
    const myIds = JSON.stringify(myArray);

    const res = await request(server)
      .delete(`/users`)
      .send({ids: myIds})
      .set('Accept', 'application/json; charset=utf-8');

    expect(res).to.have.property('status', 200);
    expect(res.headers['content-type']).to.equal(
      'application/json; charset=utf-8'
    );
  });
});

const request = require('supertest');
const app = require('./../../app');

const {
    userOne,
    userTwo,
    userThree,
    houseOne,
    inviteOne,
    setupHouseDb,
    setupHouseDbWithUser,
    setupHouseDbWithMultipleUsers,
} = require('./fixtures/db');

describe('house database is new', () => {
    beforeEach(setupHouseDb);
    test('Should create a house', async () => {
        const response = await request(app)
            .post('/api/house')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                name: "Bar house"
            })
            .expect(201);
        expect(JSON.stringify(response.body.members[0]))
            .toBe(JSON.stringify(userOne._id));
    });
    test('Should not create a house for unathenticated user', async () => {
        await request(app)
            .post('/api/house')
            .send({
                name: "Bar house"
            })
            .expect(401);
    });
})

describe('house been added and saved to user profile', () => {
    beforeEach(setupHouseDbWithUser);
    test('Should be able to invite members', async() => {
        await request(app)
            .post('/api/house/members/invite')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send(inviteOne)
            .expect(200)
    });
    test('Should not be able to invite members for unathenticated users', async() => {
        await request(app)
            .post('/api/house/members/invite')
            .send(inviteOne)
            .expect(401)
    });
    test('Should not be able to invite members if email missing', async() => {
        await request(app)
            .post('/api/house/members/invite')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                ...inviteOne,
                email: '',
            })
            .expect(400)
    });
    test('Should be able to signup members', async() => {
        await request(app)
            .get(`/api/house/members/invite/?houseId=${encodeURI(houseOne._id)}
                &houseName=${encodeURI(houseOne.name)}&userName=${encodeURI(userOne.name)}`)
            .send()
            .expect(200)
    });
    test('Should not be able to signup members if params missing', async() => {
        await request(app)
            .get(`/api/house/members/invite/`)
            .send()
            .expect(400)
    });
    test('Should not let users create more than one house', async () => {
        await request(app)
            .post('/api/house')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                name: "Bar house"
            })
            .expect(400);
    });
})

describe('house and multiple users have been added', () => {
    beforeEach(setupHouseDbWithMultipleUsers);
    test('Update a house with a new member', async () => {
        const response = await request(app)
            .patch('/api/house')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send({
                name: "Foo House"
            })
            .expect(201);
        expect(JSON.stringify(response.body.members[0]))
            .toBe(JSON.stringify(userOne._id));
        expect(JSON.stringify(response.body.members[1]))
            .toBe(JSON.stringify(userTwo._id));
    });
    test('Should not update a house if user is unathenticated', async () => {
        await request(app)
            .patch('/api/house')
            .send({
                name: "Foo House"
            })
            .expect(401);
    });
    test('Should get members of house', async () => {
        const response = await request(app)
            .get('/api/house/members')
            .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
            .send()
            .expect(200);
        expect(JSON.stringify(response.body[0]._id))
            .toBe(JSON.stringify(userOne._id));
        expect(JSON.stringify(response.body[1]._id))
            .toBe(JSON.stringify(userTwo._id));
    });
    test('Should not get members of house, if user is not a house member', async () => {
        await request(app)
            .get('/api/house/members')
            .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
            .send()
            .expect(401);
    });
})



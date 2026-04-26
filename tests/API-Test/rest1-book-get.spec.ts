/*import { expect, test } from '@playwright/test';
import bookingData from '../../test-data/api-data/api-path-data.json';
import restfulapidata from '../../test-data/api-data/restbook-api-module.json';
//import { request } from 'node:http';
//import {expect, test,request} from '../../fixtures/api-hooks-fixture';
//import CommonUtilis from '../../utilis/commonUtilis';*/



// ── Decrypt credentials from environment variables ────────────────────────────
/*const utils = new CommonUtilis();

const encryptedUsername = process.env.USER_NAME ?? '';
const encryptedPassword = process.env.PASSWORD ?? '';

const username = utils.decryptData(encryptedUsername);
const password = utils.decryptData(encryptedPassword);

// Encrypt example – useful when you need to generate a new cipher value
const reEncryptedUsername = utils.encryptData(username);
const reEncryptedPassword = utils.encryptData(password);

console.log('Decrypted Username :', username);
console.log('Decrypted Password :', password);
console.log('Re-Encrypted Username:', reEncryptedUsername);
console.log('Re-Encrypted Password:', reEncryptedPassword);*/
// ─────────────────────────────────────────────────────────────────────────────

/*test('Api Testing', async ({ request }) => {
    const bookingIds = await request.get('booking');
    const status = bookingIds.status();
    console.log('Status:', status);
    const data = await bookingIds.json();
    console.log('Booking list:', data);
});

test('API Test2', async ({ request }) => {
    const bookingId2 = await request.get('/booking/1');
    console.log('Status:', bookingId2.status());
    console.log('Booking details:', await bookingId2.json());
});*/

/*test('Fetch all booking id using GET API Call', {
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to fetch all booking id',
        }
}, async ({ request }) => {
    const bookingIdsres =await request.get(bookingData.booking_path);
    const bookingIdsresp= await bookingIdsres.json();
    console.log('Booking list:', bookingIdsresp);
    expect(bookingIdsres.status()).toBe(200);
    expect(bookingIdsres.statusText()).toBe('OK');
    expect(bookingIdsres.headers()['content-type']).toBe(restfulapidata.Content_type);
    expect(bookingIdsresp).not.toBeNull();
    
});

test('Fetch booking id 1 using GET API Call',{
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to fetch booking id 1',
        }
},async({request})=>{
    const bookingId1res = await request.get(bookingData.booking_path + '/1');
    const bookingId1resp = await bookingId1res.json();
    console.log('Booking id 1:', bookingId1resp);
    expect(bookingId1res.status()).toBe(200);
    expect(bookingId1res.statusText()).toBe('OK');
    expect(bookingId1res.headers()['content-type']).toBe(restfulapidata.Content_type);
    expect(bookingId1resp).not.toBeNull();
});*/

/*import { expect, test } from '../../fixtures/api-hooks-fixture';
import bookingData from '../../test-data/api-data/api-path-data.json';
import restfulapidata from '../../test-data/api-data/restbook-api-module.json';


test('Fetch all booking id using GET API Call', {
    tag: ['@API', '@UAT'],
    annotation: {
        type: '@API',
        description: 'This API is used to fetch all booking id',
    }
}, async ({ request }) => {
    const bookingIdsres = await request.get(bookingData.booking_path);
    const bookingIdsresp = await bookingIdsres.json();
    console.log('Booking list:', bookingIdsresp);
    expect(bookingIdsres.status()).toBe(200);
    expect(bookingIdsres.statusText()).toBe('OK');
    expect(bookingIdsres.headers()['content-type']).toBe(restfulapidata.Content_type);
    expect(bookingIdsresp).not.toBeNull();
});

test('Fetch booking id 1 using GET API Call', {
    tag: ['@API', '@UAT'],
    annotation: {
        type: '@API',
        description: 'This API is used to fetch booking id 1',
    }
}, async ({ request }) => {
    const bookingId1res = await request.get(bookingData.booking_path + '/1');
    const bookingId1resp = await bookingId1res.json();
    console.log('Booking id 1:', bookingId1resp);
    expect(bookingId1res.status()).toBe(200);
    expect(bookingId1res.statusText()).toBe('OK');
    expect(bookingId1res.headers()['content-type']).toBe(restfulapidata.Content_type);
    expect(bookingId1resp).not.toBeNull();
});*/
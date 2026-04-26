import { expect, test } from '../../fixtures/common-fixture';
import bookingData from '../../test-data/api-data/api-path-data.json';
import restfulapidata from '../../test-data/api-data/restbook-api-module.json';

test('TS-1 Fetch all booking id using GET API Call', {
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

test('TS-2 Fetch booking id 1 using GET API Call',{
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
});

test('TS-3 Verify user is able to booking',{
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to verify user is able to booking',
    }
},async({request})=>{
     const bookingPostresp = await request.post(bookingData.booking_path, {
        data: restfulapidata.create_booking.data
     });
     
     const responseBody = await bookingPostresp.json();
     console.log('Created booking response:', responseBody);
     expect(bookingPostresp.status()).toBe(200);
     expect(bookingPostresp.statusText()).toBe('OK');
     expect(responseBody).toHaveProperty('bookingid');
     expect(responseBody.booking.firstname).toBe(restfulapidata.create_booking.data.firstname);
});

test(' TS -4 User is able to update the booking id ',{
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to update the booking id',
    }
},async({request,commonAPIUtilis})=>{
    const token = await commonAPIUtilis.createToken();
    const bookingUpdateresp = await request.put(`${bookingData.booking_path}/${restfulapidata.booking_id2}`,{
        headers:{
           // Authorization:"Basic YWRtaW46cGFzc3dvcmQxMjM="
           Cookie:`token=${token}`    
        },
        data:restfulapidata.update_booking.data
        
    });

    const responseBody = await bookingUpdateresp.json();
    console.log('Updated booking response:', responseBody);
    expect(bookingUpdateresp.status()).toBe(200);
    expect(bookingUpdateresp.statusText()).toBe('OK');
    expect(responseBody.firstname).toBe(restfulapidata.update_booking.data.firstname);
});

test('TS-5 Create auth token',{
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to create auth token',
    }
},async({commonAPIUtilis})=>{
    const token = await commonAPIUtilis.createToken();

    console.log('Created auth token:', token);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
});

test('TS-6 User is partialy updated the booking id ',{
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to partialy update the booking id',
    }
},async({request,commonAPIUtilis})=>{
    const token = await commonAPIUtilis.createToken();

    const bookingPatchresp = await request.patch(`${bookingData.booking_path}/${restfulapidata.booking_id2}`,{
        headers:{
           // Authorization:"Basic YWRtaW46cGFzc3dvcmQxMjM="
           Cookie:`token=${token}`    
        },
        data:restfulapidata.patch_booking.data
        
    });

    const responseBody = await bookingPatchresp.json();
    console.log('Updated booking response:', responseBody);
    expect(bookingPatchresp.status()).toBe(200);
    expect(bookingPatchresp.statusText()).toBe('OK');
    expect(responseBody.firstname).toBe(restfulapidata.patch_booking.data.firstname);
});

test('TS-7 Verify user is able to delete the booking id ',{
    tag: ['@API', '@UAT'],
    annotation:{
        type:'@API',
        description:'This API is used to delete the booking id',
    }
},async({request,commonAPIUtilis})=>{
    const token = await commonAPIUtilis.createToken();
    const bookingDeleteresp = await request.delete(`${bookingData.booking_path}/${restfulapidata.booking_id2}`,{
        headers:{
           // Authorization:"Basic YWRtaW46cGFzc3dvcmQxMjM="
           Cookie:`token=${token}`    
        }
    });
    const responseBody = await bookingDeleteresp.text();
    console.log('Deleted booking response:', responseBody);
    expect(bookingDeleteresp.status()).toBe(201);
    expect(bookingDeleteresp.statusText()).toBe('Created');
});

const {assert} = require('chai');
const request = require('supertest');

const app = require('../../app');
const Item = require('../../models/item');

const {parseTextFromHTML, parseValueFromHTML, seedItemToDatabase} = require('../test-utils');
const {connectDatabaseAndDropData, diconnectDatabase} = require('../setup-teardown-utils');

describe('Server path: /items/:itemid', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(diconnectDatabase);

  describe('GET', () => {
    it('renders a single item with title and description', async () => {
      const item = await seedItemToDatabase();

      const response = await request(app).get('/items/' + item._id);

      assert.include(parseTextFromHTML(response.text, '#item-title'), item.title);
      assert.include(parseTextFromHTML(response.text, '#item-description'), item.description);
    });
  });
});

describe('Server path: /items/:itemid/delete', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(diconnectDatabase);

  describe('POST', () => {
    it('deletes item', async () => {
      const item = await seedItemToDatabase();

      const response = await request(app).post('/items/' + item._id + '/delete').send();
      const foundItem = await Item.findById(item._id);
      
      assert.isNull(foundItem);
    });
    
    it('redirects home', async () => {
      const item = await seedItemToDatabase();

      const response = await request(app).post('/items/' + item._id + '/delete').send();

      assert.equal(response.status, 302);
      assert.equal(response.headers.location, '/');
    });
  });
});

describe('Server path: /items/:itemid/update', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(diconnectDatabase);

  describe('GET', () => {
    it('renders update screen with populated input fields', async () => {
      const item = await seedItemToDatabase();

      const response = await request(app).get('/items/' + item._id + '/update');

      // We must use the value property (instead of the textContent property) for
      // input elements.
      assert.equal(parseValueFromHTML(response.text, 'input#title-input'), item.title);
      assert.equal(parseTextFromHTML(response.text, 'textarea#description-input'), item.description);
      assert.equal(parseValueFromHTML(response.text, 'input#imageUrl-input'), item.imageUrl);
    });
  });

  describe('POST', () => {
    it('updates selected item', async () => {
      const item = await seedItemToDatabase();
      const updatedTitle = "updated title";
      const updatedDescription = "updated description";
      const updatedImageUrl = "updated.image.url";
      
      const response = await request(app).post('/items/' + item._id + '/update').type('form').send(
	{ title: updatedTitle, description: updatedDescription, imageUrl: updatedImageUrl });
      const foundItem = await Item.findById(item._id);

      assert.equal(foundItem.title, updatedTitle);
      assert.equal(foundItem.description, updatedDescription);
      assert.equal(foundItem.imageUrl, updatedImageUrl);
    });

    it('redirects home upon successful update', async () => {
      const item = await seedItemToDatabase();
      const updatedTitle = "updated title";
      const updatedDescription = "updated description";
      const updatedImageUrl = "updated.image.url";
      
      const response = await request(app).post('/items/' + item._id + '/update').type('form').send(
	{ title: updatedTitle, description: updatedDescription, imageUrl: updatedImageUrl });

      assert.equal(response.status, 302);
      assert.equal(response.headers.location, '/');
    });
    
    it('if title is missing, item is not updated and error message is displayed', async () => {
      const item = await seedItemToDatabase();
      const updatedTitle = null;
      const updatedDescription = "updated description";
      const updatedImageUrl = "updated.image.url";
      
      const response = await request(app).post('/items/' + item._id + '/update').type('form').send(
	{ title: updatedTitle, description: updatedDescription, imageUrl: updatedImageUrl });
      const foundItem = await Item.findById(item._id);

      assert.equal(foundItem.title, item.title);
      assert.equal(foundItem.description, item.description);
      assert.equal(foundItem.imageUrl, item.imageUrl);
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });
  
    it('if description is missing, item is not updated and error message is displayed', async () => {
      const item = await seedItemToDatabase();
      const updatedTitle = "updated title";
      const updatedDescription = null;
      const updatedImageUrl = "updated.image.url";
      
      const response = await request(app).post('/items/' + item._id + '/update').type('form').send(
	{ title: updatedTitle, description: updatedDescription, imageUrl: updatedImageUrl });
      const foundItem = await Item.findById(item._id);

      assert.equal(foundItem.title, item.title);
      assert.equal(foundItem.description, item.description);
      assert.equal(foundItem.imageUrl, item.imageUrl);
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });
  
    it('if imageUrl is missing, item is not updated and error message is displayed', async () => {
      const item = await seedItemToDatabase();
      const updatedTitle = "updated title";
      const updatedDescription = "updated description";
      const updatedImageUrl = null;
      
      const response = await request(app).post('/items/' + item._id + '/update').type('form').send(
	{ title: updatedTitle, description: updatedDescription, imageUrl: updatedImageUrl });
      const foundItem = await Item.findById(item._id);

      assert.equal(foundItem.title, item.title);
      assert.equal(foundItem.description, item.description);
      assert.equal(foundItem.imageUrl, item.imageUrl);
      assert.equal(response.status, 400);
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });
});

});

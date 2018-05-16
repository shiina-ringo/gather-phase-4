const {assert} = require('chai');
const {buildItemObject} = require('../test-utils');

function submitNewItem(item) {
  browser.url('/items/create');
  browser.setValue('#title-input', item.title);
  browser.setValue('#description-input', item.description);
  browser.setValue('#imageUrl-input', item.imageUrl);
  browser.click('#submit-button');
}

describe('User visits single item', () => {
  const itemToCreate = buildItemObject();

  // In addition to resetting the URL to the main page, this magically
  // flushes the database after each test item, allowing the tests to be
  // fully isolated.
  beforeEach(() => { browser.url('/'); });

  describe('submits new item', () => {
    it('new item renders on separate page', () => {
      submitNewItem(itemToCreate);
      browser.click('.item-card a');

      assert.include(browser.getText('body'), itemToCreate.description);
    });
    
    it('back arrow redirects to main page', () => {
      const baseUrl = browser.getUrl();

      submitNewItem(itemToCreate);
      browser.click('.item-card a');
      browser.click('.back-arrow');

      assert.equal(browser.getUrl(), baseUrl);
    });
    
    it('deletes new item', () => {
      submitNewItem(itemToCreate);
      browser.submitForm('.delete-form');
      
      assert.notInclude(browser.getText('body'), itemToCreate.title);
    });

    it('update button renders populated page', () => {
      submitNewItem(itemToCreate);
      browser.click('.item-card a');
      browser.click('.update-button');

      assert.equal(browser.getValue('input#title-input'), itemToCreate.title);
      assert.equal(browser.getText('textarea#description-input'), itemToCreate.description);
      assert.equal(browser.getValue('input#imageUrl-input'), itemToCreate.imageUrl);
    });

    it('update modifies item', () => {
      const updatedTitle = "updated title";
      const updatedDescription = "updated description";
      
      submitNewItem(itemToCreate);
      browser.click('.item-card a');
      browser.click('.update-button');
      browser.setValue('input#title-input', updatedTitle);
      browser.setValue('textarea#description-input', updatedDescription);
      browser.click('.submit-button');
      browser.click('.item-card a');

      assert.include(browser.getText('body'), updatedTitle);
      assert.include(browser.getText('body'), updatedDescription);
    });

  });
});

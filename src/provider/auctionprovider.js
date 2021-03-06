/**
 * pubfood
 */

'use strict';

var util = require('../util');
var AuctionDelegate = require('../interfaces').AuctionDelegate;
var Event = require('../event');

/**
 * AuctionProvider decorates the {@link AuctionDelegate} to implement the publisher ad server requests.
 *
 * @class
 * @property {string} name the name of the provider
 * @memberof pubfood#provider
 * @param {AuctionDelegate} auctionDelegate the delegate object that implements [libUri()]{@link pubfood#provider.AuctionProvider#libUri}, [init()]{@link pubfood#provider.AuctionProvider#init} and [refresh()]{@link pubfood#provider.AuctionProvider#refresh}
 */
function AuctionProvider(auctionDelegate) {
  this.name = auctionDelegate.name || '';
  this.slots_ = [];
  this.auctionDelegate = auctionDelegate;
  this.mediator = null;
}

/**
 * Set the central auction mediator that orchestrates the auctions.
 *
 * @param {AuctionMediator} mediator - the auction mediator
 * @private
 */
AuctionProvider.prototype.setMediator = function(mediator) {
  this.mediator = mediator;
};

/**
 * Create a new [AuctionProvider]{@link pubfood#provider.AuctionProvider} from an object.
 *
 * @param {AuctionDelegate} delegate - provider object literal
 * @returns {pubfood#provider.AuctionProvider|null} instance of [AuctionProvider]{@link pubfood#provider.AuctionProvider}. <em>null</em> if delegate is invalid.
 * @private
 */
AuctionProvider.withDelegate = function(delegate) {
  if (!AuctionProvider.validate(delegate)) {
    Event.publish(Event.EVENT_TYPE.INVALID, {msg: 'Warn: invalid auction delegate - ' + (delegate && JSON.stringify(delegate)) || ''});
    return null;
  }
  var p = new AuctionProvider(delegate);
  return p;
};

/**
 * Validate a auction provider delegate.
 *
 * Checks that the delegate has the required properties specified by {@link AuctionDelegate}
 *
 * @param {AuctionDelegate} delegate - bid provider delegate object literal
 * @returns {boolean} true if delegate has required functions and properties
 * @private
 */
AuctionProvider.validate = function(delegate) {
  return util.validate(AuctionDelegate, delegate);
};

/**
 * Get the auction provider JavaScript library Uri/Url.
 *
 * @return {string}
 */
AuctionProvider.prototype.libUri = function() {
  return this.auctionDelegate.libUri;
};

/**
 * Initialize a auction provider.
 *
 * The AuctionProvider delegate Javascript and other tag setup is done here.
 *
 * @param {array.<SlotTargetingObject>} targeting - objects with bid targeting
 * @param {auctionDoneCallback} done - a callback to execute on init complete
 */
AuctionProvider.prototype.init = function(targeting, done) {
  this.auctionDelegate.init(targeting, done);
};

/**
 * Refresh for ad slots
 *
 * @param {array.<SlotTargetingObject>} targeting - objects with bid level targeting
 * @param {auctionDoneCallback} done a callback to execute on init complete
 */
AuctionProvider.prototype.refresh = function(targeting, done) {
  var refresh = (this.auctionDelegate && this.auctionDelegate.refresh) || null;
  if (!refresh) {
    Event.publish(Event.EVENT_TYPE.WARN, 'AuctionProvider.auctionDelegate.refresh not defined.');
    return;
  }
  refresh(targeting, done);
};

module.exports = AuctionProvider;

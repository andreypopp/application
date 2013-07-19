"use strict";

var util = require("substance-util");

// Substance.View
// ==========================================================================
//
// Application View abstraction, inspired by Backbone.js

var View = function(options) {

  // Either use the provided element or make up a new element
  this.$el = $('<div/>');
  this.el = this.$el[0];

  // this._handlers = [];
};


View.Prototype = function() {

  // Shorthand for selecting elements within the view
  // ----------
  //

  this.$ = function(selector) {
    return this.$el.find(selector);
  };


  // Handle a particular event
  // ----------
  //

  // View.prototype.handle = function(target, eventName, handler) {
  //   // Register binding for later disposal
  //   console.log('handling', eventName);
  //   target.on(eventName, handler, this);
  //   this._handlers.push([target, eventName, handler]);
  // };


  // Unbind event handlers
  // ----------
  //

  // View.prototype.disposeHandlers = function() {
  //   _.each(this._handlers, function(h) {
  //     var target = h[0];
  //     var eventName= h[1];
  //     var handler = h[2];
  //     console.log('unbinding ', eventName);
  //     target.unbind(eventName, handler);
  //   });
  // };
};


View.Prototype.prototype = util.Events;
View.prototype = new View.Prototype();

module.exports = View;

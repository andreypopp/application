"use strict";

var util = require("substance-util");
var _ = require("underscore");

// Substance.Application.Controller
// ==========================================================================
//
// Application Controller abstraction suggesting strict MVC

var Controller = function(options) {
  this.state = {};
  this.context = null;
};

Controller.Prototype = function() {

  // Finalize state transition
  // -----------------
  //
  // Editor View listens on state-changed events:
  //
  // Maybe this should updateContext, so it can't be confused with the app state
  // which might be more than just the current context
  // 

  this.updateState = function(context, state) {
    var oldContext = this.context;
    this.context = context;
    this.state = state;
    this.trigger('state-changed', this.context, oldContext, state);
  };

  // Inrementally updates the controller state
  // -----------------
  //

  this.modifyState = function(state) {
    _.extend(this.state, state);
    this.trigger('state-changed', this.state.context);
  };
};


// Setup prototype chain
Controller.Prototype.prototype = util.Events;
Controller.prototype = new Controller.Prototype();

module.exports = Controller;
/**
 * Copyright (c) 2010 Timothy Cardenas
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 */


G.provide("", {
  /**
   * addEvent
   *
   * Adds a eventhandler to the specified event without overriding previously
   * defined eventhanders.
   * 
   * @param object      {Object}         object to watch for the event
   * @param eventType   {String}         event type (eg click, load, blur)
   * @param eventHandler {Function}       function to handle the event
   */
  addEvent:function(object, eventType, eventHandler){
    G.eventManager.addEvent.call(G.eventManager, object, eventType, eventHandler);
  },

  /**
   * removeEvent
   *
   * Removes a eventhandler to the specified event without overriding previously
   * defined eventhanders. Must match the AddEvent call exactly
   *
   * @param object      {Object}         object to attach the event to
   * @param eventType   {String}         event type (eg click, load, blur)
   * @param eventHandler {Function}       function to handle the event
   */

  removeEvent:function(object, eventType, eventHandler){
    G.eventManager.removeEvent.call(G.eventManager, object, eventType, eventHandler);
  }

});

// AddEvent and removeEvent Taken from his excellency John Resig
G.provide("eventManager", {
  addEvent:function( obj, type, fn ) {
    if ( obj.attachEvent ) {
      obj['e'+type+fn] = fn;
      obj[type+fn] = function(){
        obj['e'+type+fn]( window.event );
      };
      obj.attachEvent( 'on'+type, obj[type+fn] );
    }
    else{
      obj.addEventListener( type, fn, false );
    }
  },

  removeEvent: function( obj, type, fn ) {
    if ( obj.detachEvent ) {
      obj.detachEvent( 'on'+type, obj[type+fn] );
      obj[type+fn] = null;
    }
    else{
      obj.removeEventListener( type, fn, false );
    }
  }

});


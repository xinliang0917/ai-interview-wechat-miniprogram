"use strict";

var OggOpusDecoder, OpusDecoderLib;
if(typeof require === 'function'){
  OpusDecoderLib = require('./libopus-decoder.js');
  OggOpusDecoder = require('./oggOpusDecoder.js').OggOpusDecoder;
} else {
  importScripts('./libopus-decoder.js');
  importScripts('./oggOpusDecoder.js');
}

var global = global || (typeof window !== 'undefined'? window : typeof self !== 'undefined'? self : this);

var decoder, cached;

function cacheEvent( evtData ){
  if(!cached) cached = [];
  cached.push(evtData);
}

function applyCachedEvents(){
  if(cached){
    for(var i=0,size=cached.length; i < size; ++i){
      global['onmessage']( {data: cached[i]} );
    }
    cached = undefined;
  }
}

function checkReady( decoder, evtData ){
  if(!decoder.isReady){
    cacheEvent(evtData);
    decoder['onready'] = applyCachedEvents;
    return false;
  }
  return true;
}

global['onmessage'] = function( e ){
  switch( e['data']['command'] ){

    case 'decode':
      if ( checkReady( decoder, e['data']) ){
        decoder.decode( e['data']['pages'], decoder.sendToOutputBuffers );
      }
      break;

    case 'done':
      if ( checkReady( decoder, e['data']) ) {
        decoder.sendLastBuffer();
        global['close']();
      }
      break;

    case 'init':
      if ( typeof e['data']['bufferLength'] === 'undefined' ) {
        e['data']['bufferLength'] = 4096; // Define size of outgoing buffer
      }
      decoder = new OggOpusDecoder( e['data'], OpusDecoderLib );
      break;

    default:
      // Ignore any unknown commands and continue recieving commands
  }
};


// extend OggOpusDecoder for automatically sending decoded data via postMessage

OggOpusDecoder.prototype.oninit = function(){
  this.resetOutputBuffers();
};

OggOpusDecoder.prototype.oncomplete = function(){
  this.sendLastBuffer();
};

OggOpusDecoder.prototype.resetOutputBuffers = function(){
  this.outputBuffers = [];
  this.outputBufferArrayBuffers = [];
  this.outputBufferIndex = 0;

  for ( var i = 0; i < this.numberOfChannels; i++ ) {
    this.outputBuffers.push( new Float32Array( this.config.bufferLength ) );
    this.outputBufferArrayBuffers.push( this.outputBuffers[i].buffer );
  }
};

OggOpusDecoder.prototype.sendToOutputBuffers = function( mergedBuffers ){
  var dataIndex = 0;
  var mergedBufferLength = mergedBuffers.length / this.numberOfChannels;

  while ( dataIndex < mergedBufferLength ) {
    var amountToCopy = Math.min( mergedBufferLength - dataIndex, this.config.bufferLength - this.outputBufferIndex );

    if (this.numberOfChannels === 1) {
      this.outputBuffers[0].set( mergedBuffers.subarray( dataIndex, dataIndex + amountToCopy ), this.outputBufferIndex );
    }

    // Deinterleave
    else {
      for ( var i = 0; i < amountToCopy; i++ ) {
        this.outputBuffers.forEach( function( buffer, channelIndex ) {
          buffer[ this.outputBufferIndex + i ] = mergedBuffers[ ( dataIndex + i ) * this.numberOfChannels + channelIndex ];
        }, this);
      }
    }

    dataIndex += amountToCopy;
    this.outputBufferIndex += amountToCopy;

    if ( this.outputBufferIndex == this.config.bufferLength ) {
      global['postMessage']( this.outputBuffers, this.outputBufferArrayBuffers );
      this.resetOutputBuffers();
    }
  }
};

OggOpusDecoder.prototype.sendLastBuffer = function(){
  this.sendToOutputBuffers( new Float32Array( ( this.config.bufferLength - this.outputBufferIndex ) * this.numberOfChannels ) );
  global['postMessage'](null);
};

var module = module || {};
module.exports = OpusDecoderLib;

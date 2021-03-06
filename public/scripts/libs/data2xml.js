// --------------------------------------------------------------------------------------------------------------------
//
// data2xml.js - A data to XML converter with a nice interface (for NodeJS).
//
// Copyright (c) 2011 AppsAttic Ltd - http://www.appsattic.com/
// Written by Andrew Chilton <chilts@appsattic.com>
//
// License: http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

define([],function(){
	var xmlHeader = '<?xml version="1.0" encoding="utf-8"?>\n';
	
	function entitify(str) {
	    str = '' + str;
	    str = str
	        .replace(/&/g, '&amp;')
	        .replace(/</g,'&lt;')
	        .replace(/>/g,'&gt;')
	        .replace(/'/g, '&apos;')
	        .replace(/"/g, '&quot;');
	    return str;
	}
	
	function makeStartTag(name, attr) {
	    attr = attr || {};
	    var tag = '<' + name;
	    for(var a in attr) {
	        tag += ' ' + a + '="' + entitify(attr[a]) + '"';
	    }
	    tag += '>';
	    return tag;
	}
	
	function makeEndTag(name) {
	    return '</' + name + '>';
	}
	
	function makeElement(name, data) {
	    var element = '';
	    var _attr=null;
	    if ( Array.isArray(data) ) {
	        data.forEach(function(v) {
	            element += makeElement(name, v);
	        });
	        return element;
	    }
	    else if ( typeof data === 'object' ) {
	    	_attr=null;
	    	
	    	if(data){
	    		_attr=data._attr;
	    	}
	        element += makeStartTag(name, _attr);
	        if (data && data._value ) {
	            element += entitify(data._value);
	        }
	        else {
	            for (var el in data) {
	                if ( el === '_attr' ) {
	                    continue;
	                }
	                element += makeElement(el, data[el]);
	            }
	        }
	        element += makeEndTag(name);
	        return element;
	    }
	    else {
	        // a piece of data on it's own can't have attributes
	        return makeStartTag(name) + entitify(data) + makeEndTag(name);
	    }
	    throw "Unknown data " + data;
	}
	
	var data2xml = function(name, data) {
	    var xml = xmlHeader;
	    xml += makeElement(name, data);
	    return xml;
	};
	
	// --------------------------------------------------------------------------------------------------------------------
	
	data2xml.entitify = entitify;
	data2xml.makeStartTag = makeStartTag;
	data2xml.makeEndTag = makeEndTag;
	data2xml.makeElement = makeElement;
	
	return data2xml;
});
// --------------------------------------------------------------------------------------------------------------------
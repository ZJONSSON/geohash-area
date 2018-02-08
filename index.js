/* jshint node:true */
"use strict";
// Provides both an encode function (lat,lon) and decode function(hash) to move between
// geographic locations and geohashes
//

// Imported from [github](https://raw.github.com/aisaacs/geohash/master/GeoHash.js)
// (C) 2012 AISAACS 

var  DICT =  "0123456789bcdefghjkmnpqrstuvwxyz";

module.exports.distance = function(start,end) {
  var dLat = Math.abs(end.lat - start.lat) * Math.PI/180;
  var dlng = Math.abs(end.lng - start.lng) * Math.PI/180;
  var lat1 = end.lat * Math.PI/180;
  var lng1 = end.lng * Math.PI/180;
  var lat2 = start.lat * Math.PI/180;
  var lng2 = start.lng * Math.PI/180;

  var d1 = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dlng/2) * Math.sin(dlng/2) * Math.cos(lat1) * Math.cos(lat2);
  return (2 * Math.atan2(Math.sqrt(d1), Math.sqrt(1-d1))) * 6371*0.621371;
};

module.exports.area = function(fn,precision) {
  var res = [];
  function visit(bounds,flag) {
    var mid;
    flag = flag || fn(bounds);
    if (!flag) return;

    bounds.bit++;

    if (bounds.bit && bounds.bit % 5 === 0) {
      bounds.hash += DICT[bounds.ch];
      bounds.ch = 0;
      if (flag == 2 || bounds.hash.length >= precision)
        return res.push(bounds);
    }

    if (bounds.bit % 2 === 0) {
      mid = (bounds.left + bounds.right) / 2;
      visit({
        hash : bounds.hash,
        bit : bounds.bit,
        ch : (bounds.ch << 1) +1,
        left : mid,
        right : bounds.right,
        top : bounds.top,
        bottom : bounds.bottom
      });
      visit({
        hash : bounds.hash,
        bit : bounds.bit,
        ch : (bounds.ch << 1),
        left : bounds.left,
        right : mid,
        top : bounds.top,
        bottom : bounds.bottom
      });
    } else {
      mid = (bounds.top+bounds.bottom) / 2;
      visit({
        hash : bounds.hash,
        bit : bounds.bit,
        ch : (bounds.ch << 1) +1,
        left : bounds.left,
        right : bounds.right,
        top : bounds.top,
        bottom : mid
      });
      visit({
        hash : bounds.hash,
        bit : bounds.bit,
        ch : (bounds.ch << 1),
        left : bounds.left,
        right : bounds.right,
        top : mid,
        bottom : bounds.bottom
      });
    }
  }

  visit({
    ch : 0,
    bit : -1,
    hash : '',
    bottom: -90.0,
    top: 90.0,
    left: -180,
    right: 180
  });
  return res;
};


function checkRect(box) {
  // We check if rectangles are not intersecting and return the negative
  // See [Stackoverflow](http://stackoverflow.com/questions/16005136)
  return function(d) {
    if (d.top < box.top && d.bottom > box.bottom && d.left > box.left && d.right < box.right)  return 2;
    var left = d.right < box.left,
    right = d.left > box.right,
    top = d.bottom > box.top,
    bottom = d.top < box.bottom;
    return !(left || right || top || bottom);
  };
}

module.exports.rect = function(lat,lng,dist,precision) {
  // Default distance is 5 miles
  dist =  5;
  // Default Precision is 5
  precision = precision || 5;

  // 1° of latitude ~= 69 miles and 1° of longitude ~= cos(latitude)*69
  // See [Mysql Distance, page 12](http://www.scribd.com/doc/2569355/Geo-Distance-Search-with-MySQL)

  var latDist = dist/69,
      lngDist = dist / Math.abs(Math.cos(lat * Math.PI / 180)*69);
  // See [RASC Calgary](http://calgary.rasc.ca/latlong.htm) for more detailed formulas    


  var box = {
    top : lat + latDist,
    bottom: lat - latDist,
    left : lng - lngDist,
    right : lng + lngDist
  };

  return module.exports.area(checkRect(box),precision);
};

module.exports.encode = function(lat, lon, precision) {
  if (!precision) precision = 12;
  var res = '',mid;

  var bounds = {
    bottom: -90.0,
    top: 90.0,
    left: -180,
    right: 180
  };

  var ch = 0;
  var bit = 0;

  while (res.length < precision){

    if (bit  % 2 ===0) {
      mid = (bounds.left + bounds.right) / 2;
      if (lon > mid) {
        ch |= 16 >> (bit % 5);
        bounds.left = mid;
      } else {
        bounds.right = mid;
      }
    } else {
      mid = (bounds.top + bounds.bottom) / 2;
      if (lat > mid) {
        ch |= 16 >> (bit % 5);
        bounds.bottom = mid;
      } else {
        bounds.top = mid;
      }
    }

    bit ++;
    if (bit % 5 === 0) {
      res += DICT[ch];
      ch = 0;
    }
  }

  return res;
};

module.exports.decode = function(hash) {
  var bounds = {
    bottom: -90.0,
    top: 90.0,
    left: -180,
    right: 180
  };

  var bit = 0,mid;

  for (var i = 0, l = hash.length; i < l; i++){
    var ch = DICT.indexOf(hash[i]);
    for (var j = 0; j < 5; j++){
      if (bit % 2 === 0) {
        mid = (bounds.left + bounds.right) / 2;
        if (ch  & (16 >> (bit % 5))){
          bounds.left = mid;
        } else {
          bounds.right = mid;
        }
      } else {
        mid = (bounds.top + bounds.bottom) / 2;
        if (ch  & (16 >> (bit % 5))){
          bounds.bottom = mid;
        } else {
          bounds.top = mid;
        }
      }

      bit ++;
    }
  }
  bounds.lat = (bounds.top + bounds.bottom) / 2;
  bounds.lng = (bounds.left + bounds.right) / 2;
  return bounds;
};

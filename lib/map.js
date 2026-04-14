// OrbMap - map.js
//
// OrbMap 0.0.1 - SVG Map generator
//
// Copyright:Isana Kashiwai
// Soucecode licensed under the MIT license.
// Output licenced under Criative Commons CC-BY-NC license

// This script requires
//"d3.v4.js",
//"topojson.v1.js",
//"d3-array.v1.js",
//"d3-geo.v1.js",
//"d3-geo-projection.v2.js"

var OrbMap;

OrbMap = OrbMap || {
  TITLE: "OrbMap",
  VERSION: "0.0.1 (20171001)",
  AUTHOR: "Isana Kashiwai"
};

OrbMap.Storage = OrbMap.Storage || {}

OrbMap.Time = OrbMap.Time || function (date) {

  if (!date) {
    var _date = new Date();
  } else {
    var _date = date;
  }

  var _getUTCArray = function (_date) {
    return {
      year: _date.getUTCFullYear(),
      month: _date.getUTCMonth() + 1,
      day: _date.getUTCDate(),
      hours: _date.getUTCHours(),
      minutes: _date.getUTCMinutes(),
      seconds: _date.getUTCSeconds()
    }
  }

  var _utc = _getUTCArray(_date);

  var _jd = function () {
    var year = _utc.year;
    var month = _utc.month;;
    var day = _utc.day;
    var calender = "";

    if (month <= 2) {
      var year = year - 1;
      var month = month + 12;
    }

    var julian_day = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day - 1524.5;

    if (calender == "julian") {
      var transition_offset = 0;
    } else if (calender == "gregorian") {
      var tmp = Math.floor(year / 100);
      var transition_offset = 2 - tmp + Math.floor(tmp / 4);
    } else if (julian_day < 2299160.5) {
      var transition_offset = 0;
    } else {
      var tmp = Math.floor(year / 100);
      var transition_offset = 2 - tmp + Math.floor(tmp / 4);
    }
    var jd = julian_day + transition_offset;
    return jd;
  }
  var _gmst = function () {
    var rad = Math.PI / 180;
    var time_in_sec = _utc.hours * 3600 + _utc.minutes * 60 + _utc.seconds;
    var jd = _jd();
    //gmst at 0:00
    var t = (jd - 2451545.0) / 36525;
    var gmst_at_zero = (24110.5484 + 8640184.812866 * t + 0.093104 * t * t + 0.0000062 * t * t * t) / 3600;
    if (gmst_at_zero > 24) { gmst_at_zero = gmst_at_zero % 24; }
    //gmst at target time
    var gmst = gmst_at_zero + (time_in_sec * 1.00273790925) / 3600;
    //mean obliquity of the ecliptic
    var e = 23 + 26.0 / 60 + 21.448 / 3600 - 46.8150 / 3600 * t - 0.00059 / 3600 * t * t + 0.001813 / 3600 * t * t * t;
    //nutation in longitude
    var omega = 125.04452 - 1934.136261 * t + 0.0020708 * t * t + t * t * t / 450000;
    var long1 = 280.4665 + 36000.7698 * t;
    var long2 = 218.3165 + 481267.8813 * t;
    var phai = -17.20 * Math.sin(omega * rad) - (-1.32 * Math.sin(2 * long1 * rad)) - 0.23 * Math.sin(2 * long2 * rad) + 0.21 * Math.sin(2 * omega * rad);
    gmst = gmst + ((phai / 15) * (Math.cos(e * rad))) / 3600
    if (gmst < 0) { gmst = gmst % 24 + 24; }
    if (gmst > 24) { gmst = gmst % 24; }
    return gmst
  }

  return {
    date: _date,
    year: Number(_utc.year),
    month: Number(_utc.month),
    day: Number(_utc.day),
    hours: Number(_utc.hours),
    minutes: Number(_utc.minutes),
    seconds: Number(_utc.seconds),
    timezone: _date.getTimezoneOffset() / 60,
    jd: _jd,
    gmst: _gmst
  } // end of return OrbMap.Time
} // end of OrbMap.Time

OrbMap.DigitsToDate = function (digits) {
  var year = Number(digits.substring(0, 4));
  var month = Number(digits.substring(4, 6));
  var day = Number(digits.substring(6, 8));
  if (digits.length > 8) {
    var hour = Number(digits.substring(8, 10));
  } else {
    var hour = 0;
  }
  if (digits.length > 10) {
    var min = Number(digits.substring(10, 12));
  } else {
    var min = 0;
  }
  if (digits.length > 12) {
    var sec = Number(digits.substring(12, 14));
  } else {
    var sec = 0;
  }
  var date = new Date();
  date.setTime(Date.UTC(year, month - 1, day, hour, min, sec))
  return date;
} //Whisper.DigitsToDate

OrbMap.FormatUTCDate = function (date) {
  var year = date.getUTCFullYear()
  var month = date.getUTCMonth() + 1
  if (month > 12) {
    year = year + 1;
    month = 12 - month;
  }
  var day = date.getUTCDate()
  var hours = date.getUTCHours()
  var minutes = date.getUTCMinutes()
  var seconds = date.getUTCSeconds()
  return year + "-" + OrbMap.ZeroFill(month) + "-" + OrbMap.ZeroFill(day) + " " + OrbMap.ZeroFill(hours) + ":" + OrbMap.ZeroFill(minutes) + ":" + OrbMap.ZeroFill(seconds)
}; //Whisper.FormatUTCDate

OrbMap.ZeroFill = function (num) {
  if (num < 10) {
    var str = "0" + num;
  } else {
    var str = num;
  }
  return str;
};

OrbMap.SunPosition = function (time) {
  var _roundAngle = function (angle) {
    if (angle > 360) {
      angle = angle % 360
    } else if (angle < 0) {
      angle = angle % 360 + 360
    } else {
      angle = angle;
    }
    return angle;
  }
  var rad = Math.PI / 180
  var time_in_day = time.hours / 24 + time.minutes / 1440 + time.seconds / 86400;
  var jd = time.jd() + time_in_day;
  var t = (jd - 2451545.0) / 36525;
  //geometric_mean_longitude
  var mean_longitude = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  //mean anomaly of the Sun
  var mean_anomaly = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  //eccentricity of the Earth's orbit
  var eccentricity = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  //Sun's equation of  the center
  var equation = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mean_anomaly * rad);
  equation += (0.019993 - 0.000101 * t) * Math.sin(2 * mean_anomaly * rad);
  equation += 0.000289 * Math.sin(3 * mean_anomaly * rad);
  //true longitude of the Sun
  var true_longitude = mean_longitude + equation;
  //true anomary of the Sun
  var true_anomary = mean_anomaly + equation;
  //radius vector, distance between center of the Sun and the Earth
  var radius = (1.000001018 * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(true_anomary * rad));

  var nao = function (t) {
    var omega = (125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t + t) / 450000) * rad;
    var L0 = (280.4665 + 36000.7698 * t) * rad
    var L1 = (218.3165 + 481267.8813 * t) * rad
    var nutation = (-17.20 / 3600) * Math.sin(omega) - (-1.32 / 3600) * Math.sin(2 * L0) - (0.23 / 3600) * Math.sin(2 * L1) + (0.21 / 3600) * Math.sin(2 * omega) / rad;
    var obliquity_zero = 23 + 26.0 / 60 + 21.448 / 3600 - (46.8150 / 3600) * t - (0.00059 / 3600) * t * t + (0.001813 / 3600) * t * t * t;
    var obliquity_delta = (9.20 / 3600) * Math.cos(omega) + (0.57 / 3600) * Math.cos(2 * L0) + (0.10 / 3600) * Math.cos(2 * L1) - (0.09 / 3600) * Math.cos(2 * omega);
    var obliquity = obliquity_zero + obliquity_delta;
    return {
      nutation: nutation,
      obliquity: obliquity
    }
  }
  var nao = new nao(t);
  var nutation = nao.nutation;
  var obliquity = nao.obliquity;
  var apparent_longitude = true_longitude + nutation;
  var longitude = apparent_longitude;

  //right asantion of the Sun
  var ra = Math.atan2(Math.cos(obliquity * rad) * Math.sin(longitude * rad), Math.cos(longitude * rad))
  ra = _roundAngle(ra / rad) / 15;
  //declination of the Sun
  var dec = Math.asin(Math.sin(obliquity * rad) * Math.sin(longitude * rad));
  dec = dec / rad;
  var distance = radius * 149597870
  //rectanger
  var x = distance * Math.cos(longitude * rad);
  var y = distance * (Math.sin(longitude * rad) * Math.cos(obliquity * rad));
  var z = distance * (Math.sin(longitude * rad) * Math.sin(obliquity * rad));
  return {
    ra: ra,
    dec: dec,
    distance: distance,
    x: x,
    y: y,
    z: z
  }
}

OrbMap.GetWindowSize = function () {
  if (window.innerWidth) {
    var width = window.innerWidth;
  }
  else if (window.documentElement && window.documentElement.clientWidth != 0) {
    var width = window.documentElement.clientWidth;
  }
  else if (window.body) {
    var width = window.body.clientWidth;
  }
  if (window.innerHeight) {
    var height = window.innerHeight;
  }
  else if (window.documentElement && window.documentElement.clientHeight != 0) {
    var height = window.documentElement.clientHeight;
  }
  else if (window.body) {
    var height = window.body.clientHeight;
  }
  return {
    width: width,
    height: height
  }
}

OrbMap.QueryDecoder = function () {
  var query = [];
  var search = decodeURIComponent(location.search);
  var q = search.replace(/^\?/, '').split("&");
  for (var i = 0, l = q.length; i < l; i++) {
    var tmp_array = q[i].split("=");
    var name = tmp_array[0];
    var value = tmp_array[1];
    query[name] = value;
  }
  return query;
}

OrbMap.ShowMap = function () {
  if (OrbMap.Storage.query.latlng) {
    OrbMap.Storage.query.center = OrbMap.Storage.query.latlng;
  }
  if (OrbMap.Storage.query.center) {
    if (OrbMap.Storage.query.center.match(/,/)) {
      var latlng = OrbMap.Storage.query.center.split(",")
      var lat = 0 - Number(latlng[0])
      var lng = 0 - Number(latlng[1])
    } else {
      var latlng = OrbMap.DecodeLatLngString(OrbMap.Storage.query.center)
      var lat = 0 - Number(latlng.latitude)
      var lng = 0 - Number(latlng.longitude)
    }
  } else {
    var lat = 0 - 35.675194
    var lng = 0 - 139.537833
  }

  if (OrbMap.Storage.query.scale) {
    var scale = Number(OrbMap.Storage.query.scale) * 100
  } else {
    var scale = 150
  }

  var width = OrbMap.Storage.window.width;
  var height = OrbMap.Storage.window.height;

  if (OrbMap.Storage.query.projection) {

    if (OrbMap.Storage.query.projection == "mercator") {
      var projection = d3.geoMercator()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([lng, lat])
        //.clipAngle(180 - 1e-3)
        .precision(0.01);
      var projection_name = "Mercator"
    } else if (OrbMap.Storage.query.projection == "equirectangular") {
      var projection = d3.geoEquirectangular()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([lng, lat])
        //.clipAngle(180 - 1e-3)
        .precision(0.01);
      var projection_name = "Equirectangular"
    } else if (OrbMap.Storage.query.projection == "azimuthalequalarea") {
      var projection = d3.geoAzimuthalEqualArea()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([lng, lat])
        //.clipAngle(180 - 1e-3)
        .precision(0.01);
      var projection_name = "Lambert azimuthal equal-area"
    } else if (OrbMap.Storage.query.projection == "mollweide") {
      var projection = d3.geoMollweide()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([lng, lat])
        //.clipAngle(180 - 1e-3)
        .precision(0.1);
      var projection_name = "Mollweide"

    } else if (OrbMap.Storage.query.projection == "orthographic") {
      var projection = d3.geoOrthographic()
        .scale(scale)
        .translate([width / 2, height / 2])
        .rotate([lng, lat])
        //.clipAngle(180 - 1e-3)
        .precision(0.01);
      var projection_name = "Orthographic"
    } else if (OrbMap.Storage.query.projection == "satellite") {
      if (OrbMap.Storage.query.tilt) {
        var tilt = OrbMap.Storage.query.tilt
      } else {
        var tilt = 0.0
      }
      if (OrbMap.Storage.query.altitude) {
        var altitude = OrbMap.Storage.query.altitude
      } else {
        var altitude = 600;
      }
      if (OrbMap.Storage.query.fov) {
        var fov = OrbMap.Storage.query.fov
      } else {
        var fov = 60;
      }
      if (OrbMap.Storage.query.rotation) {
        var rotation = OrbMap.Storage.query.rotation
      } else {
        var rotation = 0;
      }
      /*
      var deg = 180 / Math.PI
      var earth_radius = 6371;
      var snyder_p = 1.0 + altitude / earth_radius;
      var dy = altitude * Math.sin(tilt / deg);
      var dz = altitude * Math.cos(tilt / deg);
      var visible_y_extent = 2 * dz * Math.tan(0.5 * fov / deg);
      var num_pixels_y = width * .6;
      var compute_scale = earth_radius * num_pixels_y / visible_y_extent;
      var y_shift = dy * num_pixels_y / visible_y_extent;
      //console.log(dy,dz,visible_y_extent,num_pixels_y,compute_scale,y_shift)
      
      var projection = d3.geoSatellite()
        .scale(compute_scale)
        .translate([width / 2, y_shift - num_pixels_y / 2])
        .rotate([lng, lat, rotation])
        .tilt(tilt)
        .distance(snyder_p)
        //.clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6)
        .precision(0.01);
      var projection_name = "Satellite"
      */
      const deg = 180 / Math.PI;
      const earth_radius = 6371;
      const snyder_p = 1.0 + altitude / earth_radius;
      const dy = altitude * Math.sin(tilt / deg);
      const dz = altitude * Math.cos(tilt / deg);
      const visible_y_extent = 2 * dz * Math.tan((0.5 * fov) / deg);
      const num_pixels_y = width * .6;
      const compute_scale = earth_radius * (num_pixels_y / visible_y_extent);
      const y_shift = dy * (num_pixels_y / visible_y_extent);
  
      const preclip = function() {
        const alpha = Math.acos(snyder_p * Math.cos(tilt/deg) * 0.999);
        const clipDistance = d3.geoClipCircle(Math.acos(1 / snyder_p) - 1e-6);
        return alpha ? geoPipeline(
          clipDistance,
          geoRotatePhi(Math.PI + tilt/deg),
          d3.geoClipCircle(Math.PI - alpha - 1e-4), // Extra safety factor needed for large tilt values
          geoRotatePhi(-Math.PI - tilt/deg)
        ) : clipDistance;
      }
      function geoPipeline(...transforms) {  // Move to Appendix?
        return sink => {
          for (let i = transforms.length - 1; i >= 0; --i) {
            sink = transforms[i](sink);
          }
          return sink;
        };
      }
      function geoRotatePhi(deltaPhi) {
        const cosDeltaPhi = Math.cos(deltaPhi);
        const sinDeltaPhi = Math.sin(deltaPhi);
        return sink => ({
          point(lambda, phi) {
            const cosPhi = Math.cos(phi);
            const x = Math.cos(lambda) * cosPhi;
            const y = Math.sin(lambda) * cosPhi;
            const z = Math.sin(phi);
            const k = z * cosDeltaPhi + x * sinDeltaPhi;
            sink.point(Math.atan2(y, x * cosDeltaPhi - z * sinDeltaPhi), Math.asin(k));
          },
          lineStart() { sink.lineStart(); },
          lineEnd() { sink.lineEnd(); },
          polygonStart() { sink.polygonStart(); },
          polygonEnd() { sink.polygonEnd(); },
          sphere() { sink.sphere(); }
        });
      }
      projection = d3.geoSatellite()
        .scale(compute_scale)
        .translate([width / 2, y_shift + (num_pixels_y / 2)])
        .rotate([lng, lat, rotation])
        .tilt(tilt)
        .distance(snyder_p)
        .preclip(preclip())
        //.clipAngle(Math.acos(1 / compute_scale) * 180 / Math.PI - 1e-6)
        .precision(0.01);
        var projection_name = "Satellite"

    } else {
      var projection = d3.geoAzimuthalEquidistant()
        .scale(scale)
        .translate([width / 2, y_shift + num_pixels_y / 2])
        .rotate([lng, lat])
        .clipAngle(180 - 1e-3)
        .precision(0.01);
      var projection_name = "Azimuthal Equidistant"
    }
  } else {
    var projection = d3.geoAzimuthalEquidistant()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate([lng, lat])
      .clipAngle(180 - 1e-3)
      .precision(0.01);
    var projection_name = "Azimuthal Equidistant"
  }

  OrbMap.Storage.geopath = d3.geoPath()
    .projection(projection);

  //outer rim
  OrbMap.Storage.background_svg.append("path")
    .attr("clip-path", "url(#clip_rect)")
    .datum({ type: "Sphere" })
    .attr("id", "sphere")
    .attr("d", OrbMap.Storage.geopath)
    .attr("fill", "none")
    .attr("stroke", "#000000")
    .attr("stroke-width", 0.5);

  //graticule
  if (OrbMap.Storage.query.graticule) {
    var graticule_flag = OrbMap.Storage.query.graticule
  } else {
    var graticule_flag = "true";
  }
  if(OrbMap.Storage.query.graticule_step){
    var step = OrbMap.Storage.query.graticule_step;
  }else{
    var step = 10;
  }
  if (graticule_flag == "true") {
    var graticule = d3.geoGraticule().step([step,step]);
    OrbMap.Storage.background_svg.append("path")
      .attr("clip-path", "url(#clip_rect)")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", OrbMap.Storage.geopath)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", "0.5px")
      .attr("stroke-opacity", "0.5");
  }

  //draw map
  if (OrbMap.Storage.query.map != "false") {
  OrbMap.Storage.background_svg.insert("path")
    .attr("id", "map")
    .attr("clip-path", "url(#clip_rect)")
    .datum(OrbMap.Storage.map_data)
    .attr("d", OrbMap.Storage.geopath)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "0.5px");
  }
  //draw border
  if (OrbMap.Storage.query.border) {
    var border_flag = OrbMap.Storage.query.border
  } else {
    var border_flag = "false";
  }
  if (border_flag == "true") {
    //console.log(OrbMap.Storage.border_data)
    OrbMap.Storage.background_svg.insert("path", ".boundary")
      .attr("clip-path", "url(#clip_rect)")
      .datum(OrbMap.Storage.border_data)
      .attr("class", "boundary")
      .attr("d", OrbMap.Storage.geopath)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", "0.5px")
      //.attr("stroke-opacity", "0.5");
  }

  //centermark
  if (OrbMap.Storage.query.centermark) {
    var centermark_flag = OrbMap.Storage.query.centermark
  } else {
    var centermark_flag = "false";
  }
  if (centermark_flag == "true") {
    var geocircle = d3.geoCircle().center([-lng, -lat]).radius(100 / scale)
    OrbMap.Storage.background_svg.append("path")
      .attr("clip-path", "url(#clip_rect)")
      .attr("class", "geocircle")
      .attr("d", OrbMap.Storage.geopath(geocircle()))
      .attr("fill", "#000");
  }

  //terminator
  var date_str = ""
  if (OrbMap.Storage.query.terminator && OrbMap.Storage.query.terminator != "false" && OrbMap.Storage.query.terminator != "none") {
    if (OrbMap.Storage.query.terminator == "now" || OrbMap.Storage.query.terminator == "true") {
      var date = new Date()
    } else {
      var date = OrbMap.DigitsToDate(OrbMap.Storage.query.terminator)
    }
    var date_str = "(" + OrbMap.FormatUTCDate(date) + " UTC)"
    var time = new OrbMap.Time(date);
    var sun = OrbMap.SunPosition(time);
    var sun_ra = sun.ra;
    var sun_dec = sun.dec;
    var gmst = time.gmst();
    var sun_long = 180 - (gmst * 15 - sun_ra * 15);
    if (sun_long > 360) { sun_long = sun_long % 360 };
    if (sun_long < 0) { sun_long = sun_long % 360 + 360 };
    var sun_lat = 0 - sun_dec;
    var geocircle = d3.geoCircle().center([sun_long, sun_lat]).radius(89.2)
    OrbMap.Storage.background_svg.append("path")
      .attr("clip-path", "url(#clip_rect)")
      .attr("class", "geocircle")
      .attr("d", OrbMap.Storage.geopath(geocircle()))
      .attr("fill", "gray")
      .attr("stroke", "none")
      .attr("opacity", "0.2");

  }

  if (OrbMap.Storage.query.draw) {
    var draw_array = OrbMap.Storage.query.draw.split(",")
    for (var i = 0, ln = draw_array.length; i < ln; i++) {
      var object_param = draw_array[i].split(":")
      OrbMap.Draw[object_param[0]](draw_array[i])
    }
  }

  OrbMap.Storage.background_svg.append("text")
    .attr("class", "copyright")
    .attr("text-anchor", "end")
    .attr("x", width - 5)
    .attr("y", height - 5)
    .attr("fill", "#bbb")
    .attr("font-size", "10px")
    .text("Copyright © 2021 Isana Kashiwai/CC-BY-NC");

  document.getElementById("title").innerHTML = projection_name + " projection " + date_str
  document.title = projection_name + " projection"

  //download link
  if (OrbMap.Storage.query.dl) {
    var dl_flag = OrbMap.Storage.query.dl
  } else {
    var dl_flag = "false";
  }
  if (dl_flag == "true") {
    var serializer = new XMLSerializer();
    var dlsvg = d3.select('svg')
      .attr("title", "Azimuthal Equidistant Projection")
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("width", OrbMap.Storage.window.width)
      .attr("height", OrbMap.Storage.window.height)
      .node();
    OrbMap.Storage.SvgData = serializer.serializeToString(dlsvg);
    document.getElementById("indicator").innerHTML = '<form name="download"><input type="button" value="download svg file" id="download_button"></form>'
    document.getElementById("download_button").addEventListener("click", OrbMap.Download, false);
  }
}

OrbMap.DecodeLatLngString = function (str) {
  var re1 = str.match(/(.*)(N|S)(.*)(W|E)/);
  if (OrbMap.Storage.query.latlngstyle == "notam") {
    var latitude = 0;
    latitude += Number(re1[1].substr(-2, 2)) / 3600
    latitude += Number(re1[1].substr(-4, 2)) / 60
    latitude += Number(re1[1].substr(0, re1[1].length - 4))
    var longitude = 0;
    longitude += Number(re1[3].substr(-2, 2)) / 3600
    longitude += Number(re1[3].substr(-4, 2)) / 60
    longitude += Number(re1[3].substr(0, re1[3].length - 4))
  } else {
    var latitude = re1[1];
    var longitude = re1[3];
  }
  if (re1[2] == "S") {
    latitude = 0 - latitude;
  }
  if (re1[4] == "W") {
    longitude = 0 - longitude;
  }
  return {
    latitude: latitude,
    longitude: longitude
  }
}

OrbMap.DecodeDistanceString = function (str) {
  var re2 = str.match(/(\d+)(NM|KM)/);
  if (re2[2] == "NM") {
    var r = 1.852 * re2[1];
  } else {
    var r = 1.000 * re2[1];
  }
  return r
}
OrbMap.Draw = {
  circle: function (param) {
    var object_param = param.split(":")
    var position = object_param[1].split("-")
    if (object_param[2]) {
      var color = object_param[2]
    } else {
      var color = "#bbb"
    }
    if (object_param[3]) {
      var stroke_width = object_param[3] + "px"
    } else {
      var stroke_width = "0.5px"
    }
    var latlng = OrbMap.DecodeLatLngString(position[0])
    var distance = OrbMap.DecodeDistanceString(position[1])
    var radius = (360 / (12756.274 * Math.PI)) * distance
    var geocircle = d3.geoCircle().center([latlng.longitude, latlng.latitude]).radius(radius)
    OrbMap.Storage.background_svg.append("path")
      .attr("clip-path", "url(#clip_rect)")
      .attr("class", "geocircle")
      .attr("d", OrbMap.Storage.geopath(geocircle()))
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", stroke_width);
  },
  line: function (param) {
    var object_param = param.split(":")
    var latlng_array = object_param[1].split("-")
    if (object_param[2]) {
      var color = object_param[2]
    } else {
      var color = "#555"
    }
    if (object_param[3]) {
      var stroke_width = object_param[3] + "px"
    } else {
      var stroke_width = "1.0papx"
    }
    var coord_array = []
    for (var i = 0, ln = latlng_array.length; i < ln; i++) {
      var latlng = OrbMap.DecodeLatLngString(latlng_array[i])
      coord_array.push([latlng.longitude, latlng.latitude])
    }
    var geoline = { type: 'Feature', geometry: { type: 'LineString', coordinates: coord_array } }
    OrbMap.Storage.background_svg.append("path")
      .attr("clip-path", "url(#clip_rect)")
      .attr("class", "geocircle")
      .attr("d", OrbMap.Storage.geopath(geoline))
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", stroke_width);
  },
  dot: function (param, color) {
    var object_param = param.split(":")
    var position = object_param[1].split("-")
    if (object_param[2]) {
      var color = object_param[2]
    } else {
      var color = "#555"
    }
    var latlng = OrbMap.DecodeLatLngString(position[0])
    var distance = OrbMap.DecodeDistanceString(position[1])
    var radius = (360 / (12756.274 * Math.PI)) * distance
    var geocircle = d3.geoCircle().center([latlng.longitude, latlng.latitude]).radius(radius)
    OrbMap.Storage.background_svg.append("path")
      .attr("clip-path", "url(#clip_rect)")
      .attr("class", "geocircle")
      .attr("d", OrbMap.Storage.geopath(geocircle()))
      .attr("fill", color)
  },
  text: function (param) {
    OrbMap.Storage.background_svg.append("text")
      .attr("class", "copyright")
      .attr("text-anchor", "end")
      .attr("x", width - 5)
      .attr("y", height - 5)
      .attr("fill", "#bbb")
      .attr("font-size", "10px")
      .text("Copyright:OrbMap/Isana Kashiwai");

  }

}

OrbMap.Download = function () {
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  //var source = doctype + OrbMap.Storage.SvgData
  var source = OrbMap.Storage.SvgData
  var url = window.URL.createObjectURL(new Blob([source], { "type": "text\/xml" }));
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.setAttribute("download", "map.svg");
  a.setAttribute("href", url);
  a.style["display"] = "none";
  a.click();
}

OrbMap.ZoomInButton = function () {

}
OrbMap.ZoomOutButton = function () {

}
OrbMap.ToggleConfigPanel = function (event) {
  if (OrbMap.Storage.ConfigPanel == false) {
    OrbMap.ShowConfigPanel()
    OrbMap.ConfigPanel = true
  } else {
    OrbMap.CloseConfigPanel()
    OrbMap.Storage.ConfigPanel = false
  }
}
OrbMap.CloseConfigPanel = function () {
  var conf = document.getElementById("config_panel");
  var perent_obj = conf.parentNode;
  perent_obj.removeChild(conf);
  OrbMap.Storage.ConfigPanel = false
}

OrbMap.ShowConfigPanel = function () {
  var perent_obj = document.getElementsByTagName("body")[0];
  var cf_element = document.createElement('div');
  cf_element.id = "config_panel";
  cf_element.setAttribute('id', "config_panel");
  var cfstyle = cf_element.style;
  cfstyle.cssText += 'filter: alpha(opacity=80); -moz-opacity:0.80; opacity:0.80;';
  cfstyle.position = 'absolute';
  cfstyle.backgroundColor = '#000';
  cfstyle.left = "30px";
  cfstyle.top = "30px";
  cfstyle.right = "30px";
  cfstyle.bottom = "30px";
  cfstyle.zIndex = '600';
  perent_obj.appendChild(cf_element);
  var str = '<div id="config_panel_header">' + OrbMap.ConfigPanelItems.header + '</div>\n<div id="config_panel_body" class="scrollable"></div>'
  cf_element.innerHTML = str
  OrbMap.SwitchConfigPanel.Info()
  document.getElementById("config_panel_close").addEventListener('click', OrbMap.CloseConfigPanel, false);
  document.getElementById("config_panel_info").addEventListener('click', OrbMap.SwitchConfigPanel.Info, false);
  //document.getElementById("config_panel_timeline").addEventListener('click',OrbMap.SwitchConfigPanel.Timeline,false);
  document.getElementById("config_panel_config").addEventListener('click', OrbMap.SwitchConfigPanel.Config, false);
  OrbMap.Storage.ConfigPanel = true
}

OrbMap.SwitchConfigPanel = {
  Info: function () {
    var body_target = "info"
    var str = OrbMap.ConfigPanelItems[body_target] + OrbMap.ConfigPanelItems["copyright"]
    document.getElementById("config_panel_body").innerHTML = str
  },
  Config: function () {
    document.getElementById("config_panel_body").innerHTML = OrbMap.ConfigPanelItems["config"];
    var form = document.config
    if (OrbMap.Storage.ert_mode == true) {
      form.ert_mode.checked = true
    } else {
      form.ert_mode.checked = false
    }
    if (OrbMap.Storage.star_visibility == true) {
      form.star_visibility.checked = true
    } else {
      form.star_visibility.checked = false
    }
    if (OrbMap.Storage.orbit_line_visibility == true) {
      form.orbit_line_visibility.checked = true
    } else {
      form.orbit_line_visibility.checked = false
    }
    if (OrbMap.Storage.label_visibility == true) {
      form.label_visibility.checked = true
    } else {
      form.label_visibility.checked = false
    }
  }
}

OrbMap.ToggleConfigPanel = function (event) {
  if (OrbMap.Storage.ConfigPanel == false) {
    OrbMap.ShowConfigPanel()
    OrbMap.ConfigPanel = true
  } else {
    OrbMap.CloseConfigPanel()
    OrbMap.Storage.ConfigPanel = false
  }
}
OrbMap.CloseConfigPanel = function () {
  var conf = document.getElementById("config_panel");
  var perent_obj = conf.parentNode;
  perent_obj.removeChild(conf);
  OrbMap.Storage.ConfigPanel = false
}

OrbMap.ConfigPanelItems = {
  "header": '<p id="config_panel_close"><img src="./image/close_icon.png"></p><p id="config_icons"></div><div id="config_panel_config"><img src="./image/config_icon.png" /></div><div id="config_panel_info"><img src="./image/info_icon.png" /></div></p>',
  "info": "<p><strong>Cassini Grand Finale Realtime Simulation</strong></p>",
  "copyright": "<p><strong>Copyright (c) 2017 Isana Kashiwai & Go Miyazaki</strong></p><p>Produced & Coded by Isana Kashiwai</p><p>Cassini 3D Model is originated with NASA (Convert & modified by Go Miyazaki)</p><p>About Cassini Grand Finale : <a href='https://saturn.jpl.nasa.gov/mission/grand-finale/overview/'>Cassini: Mission to Saturn: Overview</a><p>Trajectory & Atitude: <a href='http://ssd.jpl.nasa.gov/?horizons' target='_blank'>JPL HORIZONS System</a>, <a href='https://naif.jpl.nasa.gov/naif/index.html' target='_blank'>NASA/NAIF</a>,  <a href='https://eyes.nasa.gov/' target='_blank'>NASA\'s Eyes</a> and other sources.</p><p><a href='http://www.solarsystemscope.com/textures/' target='_blank'>Satrun body texture</a> by <a href='http://www.solarsystemscope.com/' target='_blank'>Solar System Scope</a></p><p><a href='http://alpha-element.deviantart.com/art/Stock-Image-Saturn-Rings-393767006' target='_blank'>Saturn rings texture</a> by <a href='http://alpha-element.deviantart.com/' target='_blank'>Alpha-Element</a></p><p>This software includes <a href='http://threejs.org/' target='_blank'>Three.js</a>, <a href='https://github.com/douglascrockford/JSON-js' target='_blank'>JSON2.js</a> and <a href='http://www.lizard-tail.com/isana/lab/orb/' target='_blank'>Orb.js</a> libraries.</p><p><strong>Administrator: </strong><br/>Isana Kashiwai (isana.k  at gmail.com)<br/>Twitter: @lizard_isana</p><p><strong>PLEASE DO NOT USE THIS APP INSIDE IFRAME OR OTHER APPLICATION.</strong><br/>This application is not intended to work properly inside the iframe or any application. And also our web server has the strict limitation of data trafic. If it exceeds these limits, the service must be closed. So please don\'t.</p>",
  "timeline": '<div id="event_timeline"></div>',
  "config": '<div id="settings"><form name="config"><h2>Time mode</h2><p><strong>Earth Receive Time mode: </strong><input type="checkbox" name="ert_mode" onChange="OrbMap.SwitchERTMode()"/><br/>"Earth Receive Time" is the time that the signal from the spacecraft reaches Earth. And "Spacecraft Event Time" is the time that the event actually happen on the spacecraft. At the Grand Finale, the delay is about 1 hour 23 minutes. </p><h2>Visibility</h2><p id="star_visibility"><strong>Stars: </strong><input type="checkbox" name="star_visibility" onChange="OrbMap.SwitchStarVisibility()"/></p><p id="orbit_line_visibility"><strong>Orbit Lines: </strong><input type="checkbox" name="orbit_line_visibility" onChange="OrbMap.SwitchOrbitLineVisibility()"/></p><p id="label_visibility"><strong>Name Labels: </strong><input type="checkbox" name="label_visibility" onChange="OrbMap.SwitchLabelVisibility()"/></p><!--<p id="mission_sequence_visibility"><strong>Mission Sequence : </strong><input type="checkbox" name="mission_sequence_visibility" onChange="OrbMap.SwitchSequenceVisibility()"/></p>--></form></div>'
}


OrbMap.StartUp = function () {
  OrbMap.Storage.query = OrbMap.QueryDecoder()
  OrbMap.Storage.window = OrbMap.GetWindowSize()
  OrbMap.Storage.window.height = OrbMap.Storage.window.height
  OrbMap.Storage.foreground = document.getElementById("foreground")
  OrbMap.Storage.background = document.getElementById("background")

  OrbMap.Storage.background_svg = d3.select(OrbMap.Storage.background).append("svg")
    .attr("id", "background_svg");

  OrbMap.Storage.background_svg.append('clipPath')
    .attr('id', 'clip_rect')
    .append("rect")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("height", OrbMap.Storage.window.height)    // set the height
    .attr("width", OrbMap.Storage.window.width);
  //console.log(OrbMap.Storage.query.accuracy)
  if (OrbMap.Storage.query.accuracy == "high") {
    var data_file = "./data/world-10m.high.json";
  } else if(OrbMap.Storage.query.accuracy == "mid"){
    var data_file = "./data/world-10m.mid.json";
  } else if(OrbMap.Storage.query.accuracy == "low"){
    var data_file = "./data/world-10m.low.json";
  } else {
    var data_file = "./data/world-50m.json";
  }
  d3.json(data_file, function (error, topology) {
    OrbMap.Storage.map_data = topojson.feature(topology, topology.objects.land);
    //OrbMap.Storage.border_data = topojson.mesh(topology, topology.objects.countries, function (a, b) { return a !== b; })
    OrbMap.ShowMap()
  });

  //init zoom buttons
  //var zoomin = document.getElementById('zoomin').addEventListener('click', OrbMap.ZoomInButton, false);
  //var zoomout = document.getElementById('zoomout').addEventListener('click', OrbMap.ZoomOutButton, false);
  //init config panel
  OrbMap.Storage.ConfigPanel = false;
  //document.getElementById('config').addEventListener('click', OrbMap.ToggleConfigPanel, false);

}

window.onload = function () {
  OrbMap.StartUp();
}

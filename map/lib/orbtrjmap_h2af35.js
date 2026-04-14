
var OrbTrjMap;

OrbTrjMap = OrbTrjMap || {
    TITLE: "H2AF35 / MICHIBIKI3 Launch Trajectory",
    VERSION : "0.0.1 (20160825)",
    AUTHOR : "Isana Kashiwai"
};

OrbTrjMap.Storage = OrbTrjMap.Storage ||  {}

OrbTrjMap.DataLoader = function(option){
    var XMLhttpObject;
    var createXMLhttpObject = function(){
      XMLhttpObject = false;
      if(window.XMLHttpRequest) {
        XMLhttpObject = new XMLHttpRequest();
      }else if(window.ActiveXObject) {
        try {
          XMLhttpObject = new ActiveXObject("Msxml2.XMLHTTP");
        }catch(e){
          if(console){console.log(e)}
          XMLhttpObject = new ActiveXObject("Microsoft.XMLHTTP");
        }
      }
      return XMLhttpObject;
    }

    var Loader = function(option) {
      XMLhttpObject=createXMLhttpObject();
      if (!XMLhttpObject){return;}
      XMLhttpObject.open("GET", option.path, option.ajax);
      XMLhttpObject.send(null);
      if(option.ajax==false){
        try{
          if(option.format === "json"){
            var data = JSON.parse(XMLhttpObject.responseText);
          }else{
            var data = XMLhttpObject.responseText;
          }
          if(option.callback !== undefined){
            option.callback(data,option.id);
          }else{
            return data;
          }
        }catch(e){
          if(console){console.log(e)}
          return;
        }
      }else{
        try{
          XMLhttpObject.onreadystatechange = function() {
            if(XMLhttpObject.readyState == 4){
              if(XMLhttpObject.status == 200){
                if(option.format === "json"){
                  var data = JSON.parse(XMLhttpObject.responseText);
                }else{
                  var data = XMLhttpObject.responseText;
                }
                if(option.callback){
                  option.callback(data,option.id);
                }else{
                  return data;
                }
              }
            }else{
              return;
            }
          }
        }catch(e){
          if(console){console.log(e)}
          return;
        }
      }
    }
    return Loader(option);
  } // end OrbTrjMap.DataLoader

OrbTrjMap.GetElementSize = function(element) {
  if (element.innerWidth !== undefined) {
    var width = element.innerWidth;
    var height = element.innerHeight;
  } else if (element.offsetWidth !== undefined) {
    var width = element.offsetWidth;
    var height = element.offsetHeight;
  }
  return {
    width: width,
    height: height
  };
};

OrbTrjMap.GetWindowSize=function() {
    if ( window.innerWidth ) {
      var width = window.innerWidth;
    }
    else if ( window.documentElement && window.documentElement.clientWidth != 0 ) {
      var width =  window.documentElement.clientWidth;
    }
    else if ( window.body ) {
      var width = window.body.clientWidth;
    }
    if ( window.innerHeight ) {
      var height = window.innerHeight;
    }
    else if ( window.documentElement && window.documentElement.clientHeight != 0 ) {
      var height =  window.documentElement.clientHeight;
    }
    else if ( window.body ) {
      var height =  window.body.clientHeight;
    }
    return {
      width: width,
      height: height
    }
  }

OrbTrjMap.FitToWindow = function(screen){
   OrbTrjMap.Storage.window_resize_timer_flag = OrbTrjMap.Storage.window_resize_timer_flag || false
   OrbTrjMap.Storage.screen = screen
  if(OrbTrjMap.Storage.window_resize_timer_flag === false){
    OrbTrjMap.Storage.window_resize_timer = window.setTimeout(function(){
      var new_screen_size = OrbTrjMap.GetWindowSize();
      var d = OrbTrjMap.Storage.screen.style;
      d.width  = new_screen_size.width + "px";
      d.height  = new_screen_size.height + "px";
      if(OrbTrjMap.Storage.window_resize_timer_flag === true){
        clearTimeout(OrbTrjMap.Storage.window_resize_timer);
        OrbTrjMap.Storage.window_resize_timer_flag = false
      }
    },500);
    OrbTrjMap.Storage.window_resize_timer_flag = true;
  }
}

OrbTrjMap.QueryDecoder = function(){
    var query=[];
    var search = decodeURIComponent(location.search);
    var q = search.replace(/^\?/, '').split("&");
    for(var i=0, l = q.length; i<l;i++){
      var tmp_array = q[i].split("=");
      var name = tmp_array[0];
      var value = tmp_array[1];
      query[name] = value;
    }
    return query;
  }

OrbTrjMap.DecodeDateString = function(str,tz){
  var str_array = str.split(" ");
  var date_array = str_array[0].split("-");
  var time_array = str_array[1].split(":");
  var year = date_array[0];
  var month = Number(date_array[1]);
  var day = Number(date_array[2]);
  var hour = Number(time_array[0])+tz;
  var min = Number(time_array[1]);
  var sec = Number(time_array[2]);

  var date = new Date();
  date.setTime(Date.UTC(year,month-1,day,hour,min,sec))
  return date;
}

OrbTrjMap.DigitsToDate =function(digits){
    var year =Number(digits.substring(0,4));
    var month = Number(digits.substring(4,6));
    var day = Number(digits.substring(6,8));
    if(digits.length>8){
      var hour = Number(digits.substring(8,10));
    }else{
      var hour = 0;
    }
    if(digits.length>10){
      var min = Number(digits.substring(10,12));
    }else{
      var min = 0;
    }
    if(digits.length>12){
      var sec = Number(digits.substring(12,14));
    }else{
      var sec = 0;
    }
    var date = new Date();
    date.setTime(Date.UTC(year,month-1,day,hour,min,sec))
    return date;
  }

OrbTrjMap.ZeroFill = function(num) {
  if (num < 10) {
    var str = "0" + num;
  } else {
    var str = num;
  }
  return str;
};

OrbTrjMap.FormatUTCDate = function(date){
var year = date.getUTCFullYear()
var month = date.getUTCMonth()+1
if(month>12){
  year = year +1;
  month = 12-month;
}
var day = date.getUTCDate()
var hours = date.getUTCHours()
var minutes = date.getUTCMinutes()
var seconds = date.getUTCSeconds()

return year +"-"+OrbTrjMap.ZeroFill(month) + "-" + OrbTrjMap.ZeroFill(day)  + " " + OrbTrjMap.ZeroFill(hours) + ":" + OrbTrjMap.ZeroFill(minutes) + ":" + OrbTrjMap.ZeroFill(seconds)
}

OrbTrjMap.FormatLocalDate = function(date){
var year = date.getFullYear()
var month = date.getUTCMonth()+1
if(month>12){
  year = year +1;
  month = 12-month;
}
var day = date.getDate()
var hours = date.getHours()
var minutes = date.getMinutes()
var seconds = date.getSeconds()

return year +"-"+OrbTrjMap.ZeroFill(month) + "-" + OrbTrjMap.ZeroFill(day)  + " " + OrbTrjMap.ZeroFill(hours) + ":" + OrbTrjMap.ZeroFill(minutes) + ":" + OrbTrjMap.ZeroFill(seconds)
}

OrbTrjMap.ElapsedTime = function(from, to) {
  var cd = {};
  cd.millseconds = to - from;
  if (cd.millseconds < 0) {
    cd.sign = "-";
  } else {
    cd.sign = "+";
  }
  cd.sec = Math.abs(cd.millseconds / 1000);
  cd.d = cd.sec / 86400;
  cd.days = Math.floor(cd.d);
  //cd.h = (cd.d - cd.days)*24
  cd.h = (cd.sec - cd.days * 86400) / 3600;
  cd.hours = Math.floor(cd.h);
  //cd.m = (cd.h - cd.hours)*60
  cd.m = (cd.sec - cd.days * 86400 - cd.hours * 3600) / 60;
  cd.minutes = Math.floor(cd.m);
  //cd.s = (cd.m - cd.minutes)*60
  cd.s = cd.sec - cd.days * 86400 - cd.hours * 3600 - cd.minutes * 60;
  cd.seconds = Math.floor(cd.s);
  return {
    sign: cd.sign,
    days: cd.days,
    hours: cd.hours,
    minutes: cd.minutes,
    seconds: cd.seconds
  };
};

/*
OrbTrjMap.DataLoaded = function(data,id){
      OrbTrjMap.Storage.Data = OrbTrjMap.DecodeOfficialData({
        data:data,
        now:OrbTrjMap.Storage.now,
        start: new Date(Date.UTC(2014, 11, 3, 5, 0, 0)),
        end:new Date(Date.UTC(2018, 5, 4, 4, 59, 59))
      })
      OrbTrjMap.Activate()
}
*/

OrbTrjMap.SetDefautls= function(){
  //set constant
  OrbTrjMap.Storage.RAD=Math.PI/180;
  OrbTrjMap.Storage.DEG=180/Math.PI;
  OrbTrjMap.Storage.launch_date = OrbTrjMap.Default.launch_date
  OrbTrjMap.Storage.orbit_insertion = OrbTrjMap.Default.orbit_insertion
  OrbTrjMap.Storage.zerohour = OrbTrjMap.Storage.launch_date
  OrbTrjMap.Storage.window = OrbTrjMap.GetWindowSize()
  OrbTrjMap.Storage.foreground = document.getElementById("foreground")
  OrbTrjMap.Storage.background = document.getElementById("background")
  OrbTrjMap.Storage.pixelratio = window.devicePixelRatio || 1
  OrbTrjMap.Storage.stroke_width = 1.2/OrbTrjMap.Storage.pixelratio
  OrbTrjMap.Storage.path = {
    "data":"./data/"
  }
  OrbTrjMap.Storage.CurrentSequenceIndex=0
  OrbTrjMap.Storage.orbit_insertion_flag = false
  OrbTrjMap.Storage.abort_message_flag = false
}

OrbTrjMap.Initialize = function(){
  //set defaults
  var query = OrbTrjMap.QueryDecoder()
  OrbTrjMap.SetDefautls();

  //set time
  if(query.t){
    var d = new Date()
    var target_time = OrbTrjMap.DigitsToDate(query.t)
    var time_offset = target_time.getTime() - d.getTime()
  }else{
    var time_offset =0;
  }
  OrbTrjMap.Storage.time_offset = time_offset

  var now = new Date();
  OrbTrjMap.Storage.now  = new Date()
  OrbTrjMap.Storage.now.setTime(now.getTime()+OrbTrjMap.Storage.time_offset);
  OrbTrjMap.Storage.ElapsedTime = (OrbTrjMap.Storage.now.getTime()-OrbTrjMap.Storage.launch_date.getTime())/1000

  OrbTrjMap.Storage.LoadedDetaNum = 0;

  OrbTrjMap.Activate()
}

OrbTrjMap.Activate = function(){
  OrbTrjMap.Storage.TrajectoryData = OrbTrjMap.DecodeTrajectoryData(OrbTrjMap.Trajectory)
  OrbTrjMap.Storage.Sequence = OrbTrjMap.DecodeSequence(OrbTrjMap.Sequence)
  OrbTrjMap.Storage.elapsed_time_func = d3.interpolateBasis(OrbTrjMap.Storage.TrajectoryData.elapsed_time)
  OrbTrjMap.Storage.latitude_func = d3.interpolateBasis(OrbTrjMap.Storage.TrajectoryData.latitude)
  OrbTrjMap.Storage.longitude_func = d3.interpolateBasis(OrbTrjMap.Storage.TrajectoryData.longitude)
  OrbTrjMap.Storage.Label = OrbTrjMap.DecodeLabelData(OrbTrjMap.Trajectory);
  OrbTrjMap.Storage.Map = OrbTrjMap.InitMap()

  //init config panel
  OrbTrjMap.Storage.ConfigPanel = false;
  var config_icon = document.getElementById('config');
  if(config_icon){
  config_icon.addEventListener('click', OrbTrjMap.ToggleConfigPanel, false);
  }

  OrbTrjMap.Storage.ElapsedTime = 0;

  OrbTrjMap.Storage.ShortUpdator = setInterval("OrbTrjMap.ShortUpdator()",1000);
  //OrbTrjMap.Storage.MidUpdator = setInterval("OrbTrjMap.MidUpdator()",10000);
}

OrbTrjMap.DecodeLabelData = function(data){
  var label_array =[]
  for(var i=0, ln=data.length; i<ln; i++){
    var label = data[i].label
    if(label.length>0){
     var time = data[i].elapsed_time
     var v = OrbTrjMap.FindElapsedTimeValue(time)
     var lat = OrbTrjMap.Storage.latitude_func(v)
     var lng = OrbTrjMap.Storage.longitude_func(v)
     if(data[i].label_offset){
       var label_offset = data[i].label_offset
     }else{
       var label_offset = [1,1]
     }
     if(data[i].baseline){
       var baseline = data[i].baseline
     }else{
       var baseline = "auto"
     }
     label_array.push({
       latitude:lat,
       longitude:lng,
       label:label,
       label_offset:label_offset,
       baseline:baseline
       })
    }
  }
  return label_array
}

OrbTrjMap.DecodeTrajectoryData = function(data){
  var elapsed_time_array=[]
  var latitude_array = []
  var longitude_array = []
  var altitude_array = []
  var latlng_array =[]
  for(var i=0, ln=data.length; i<ln; i++){
    if(String(data[i].elapsed_time).indexOf(':')>0){
      var time_array = data[i].elapsed_time.split(":")
      var elapsed = Number(time_array[0])*3600+Number(time_array[1])*60+Number(time_array[2]);
    }else{
     var elapsed = Number(String(data[i].elapsed_time))
    }
    var latitude= data[i].latitude

    if(Number(data[i].longitude)>0){
      var longitude= data[i].longitude
    }else{
      var longitude= data[i].longitude+360
    }
    elapsed_time_array.push(elapsed)
    latlng_array.push([latitude,longitude])
    latitude_array.push(latitude)
    longitude_array.push(longitude)
    altitude_array.push(Number(data[i].altitude))
  }
  return {
    elapsed_time:elapsed_time_array,
    latlng:latlng_array,
    latitude:latitude_array,
    longitude:longitude_array,
    altitude:altitude_array
  }
}

OrbTrjMap.InitMap = function(){
  var background = OrbTrjMap.Storage.background
  var foreground = OrbTrjMap.Storage.foreground
  var svg_width = OrbTrjMap.Storage.window.width;
  var svg_height = OrbTrjMap.Storage.window.width/2;
  background.style.width = svg_width + "px"
  background.style.height = svg_height + "px"
  foreground.style.width = svg_width + "px"
  foreground.style.height = svg_height + "px"

  OrbTrjMap.Storage.background_svg = d3.select(background).append("svg")
    .attr("id","background_svg")

  OrbTrjMap.Storage.foreground_svg = d3.select(foreground).append("svg")
    .attr("id","foreground_svg")

  OrbTrjMap.Storage.background_svg.insert("path")
    .attr("id","map")


  var x_scale = d3.scaleLinear()
    .domain(OrbTrjMap.Default.domain.x)
    .range([0,svg_width]);

  var y_scale = d3.scaleLinear()
    .domain(OrbTrjMap.Default.domain.y)
    .range([0,svg_height]);


  OrbTrjMap.Storage.background_svg.append("g")
    .attr("id","graticule")

  OrbTrjMap.Storage.background_svg.append("g")
    .attr("id","dsn")

  OrbTrjMap.Storage.foreground_svg.append("path")
    .attr("id", "launch_trajectory")

  var label = OrbTrjMap.Storage.Label
  for(var i=0,ln=label.length;i<ln;i++){
    OrbTrjMap.Storage.foreground_svg.append("circle")
      .attr("class", "label_dot")
      .attr("id", "label_dot"+i)

    OrbTrjMap.Storage.foreground_svg.append("text")
      .attr("class", "label_text")
      .attr("id", "label_text"+i)
  }


    OrbTrjMap.Storage.foreground_svg.append("rect")
      .attr("class", "cdbg")
      .attr("id", "cdbg")

    OrbTrjMap.Storage.foreground_svg.append("text")
      .attr("class", "countdown")
      .attr("id", "countdown")

    OrbTrjMap.Storage.foreground_svg.append("text")
      .attr("class", "countdown")
      .attr("id", "next1_sequence")

    OrbTrjMap.Storage.foreground_svg.append("text")
      .attr("class", "countdown")
      .attr("id", "next2_sequence")

    OrbTrjMap.Storage.foreground_svg.append("text")
      .attr("class", "countdown")
      .attr("id", "next3_sequence")

  OrbTrjMap.Storage.foreground_svg.append("circle")
    .attr("id", "launch_vehicle")


  OrbTrjMap.Storage.Trajectory = []

   for(var i=0, ln=1; i<=ln;i=i+0.001){
     OrbTrjMap.Storage.Trajectory.push([OrbTrjMap.Storage.latitude_func(i),OrbTrjMap.Storage.longitude_func(i)])
   }

  // world-50m.json, world_110m.json, world-110m2.json
  d3.json("./data/world-50m.json", function(error, topology) {
     OrbTrjMap.Storage.map_data = topojson.feature(topology, topology.objects.land)
     OrbTrjMap.UpdateMap()
   });

// --- //

 }

OrbTrjMap.UpdateMap = function(){
  var background = OrbTrjMap.Storage.background
  var foreground = OrbTrjMap.Storage.foreground
  var svg_width = OrbTrjMap.Storage.window.width;
  var svg_height = OrbTrjMap.Storage.window.width/2;
  background.style.width = svg_width + "px"
  background.style.height = svg_height + "px"
  background.style.top = OrbTrjMap.Storage.window.height/2-svg_height/2 + "px"

  foreground.style.width = svg_width + "px"
  foreground.style.height = svg_height + "px"
  foreground.style.top = OrbTrjMap.Storage.window.height/2-svg_height/2 + "px"

  var margin = {top: 0, right: 0, bottom: 0, left: 0}


  var projection = d3.geoEquirectangular()
    .center(OrbTrjMap.Default.projection.center)
    .scale((svg_width/630)*100*OrbTrjMap.Default.projection.scale)
    .rotate(OrbTrjMap.Default.projection.rotate)
    .translate([svg_width / 2, svg_height / 2]);

  var path = d3.geoPath()
    .projection(projection);

  d3.select(background).select("#background_svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .attr("viewBox", "0 0 "+ svg_width +" " + svg_height +"")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  d3.select("#background_svg").select("#map")
      .datum(OrbTrjMap.Storage.map_data)
      .attr("d", path)
      .attr("stroke-width", OrbTrjMap.Storage.stroke_width)


  var x_scale = d3.scaleLinear()
    .domain(OrbTrjMap.Default.domain.x)
    .range([0,svg_width]);

  var y_scale = d3.scaleLinear()
    .domain(OrbTrjMap.Default.domain.y)
    .range([0,svg_height]);

  var scale_line = d3.line()
    .x(function(d) {
        return x_scale(d[1]) ;
    })
    .y(function(d) {
      return  y_scale(d[0]);
    })

  d3.select(background).select("#graticule").selectAll("path").remove()
  var step = OrbTrjMap.Default.cross.step
  var cross_size=OrbTrjMap.Default.cross.size
  for(var lat=OrbTrjMap.Default.domain.y[1]+step,latln=OrbTrjMap.Default.domain.y[0]-step;lat<=latln;lat=lat+step){
    for(var lng=OrbTrjMap.Default.domain.x[0]+step,lngln=OrbTrjMap.Default.domain.x[1]-step;lng<=lngln;lng=lng+step){
      var tmp_array1 = [[lat-cross_size,lng],[lat+cross_size,lng]]
      d3.select(background).select("#graticule").append("path")
        .attr("d", scale_line(tmp_array1))
        .attr("stroke-width", 1.0/OrbTrjMap.Storage.pixelratio)
      var tmp_array2 = [[lat,lng-cross_size],[lat,lng+cross_size]]
  d3.select(background).select("#graticule").append("path")
    .attr("d", scale_line(tmp_array2))
    .attr("stroke-width", 1.0/OrbTrjMap.Storage.pixelratio)

    }
  }

d3.select(foreground).select("#foreground_svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .attr("viewBox", "0 0 "+ svg_width +" " + svg_height +"")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


 var data = OrbTrjMap.Storage.Trajectory
 d3.select(foreground).select("#launch_trajectory")
      .attr("d",  scale_line(data))
      .attr("stroke-width", OrbTrjMap.Storage.stroke_width)
      .attr("stroke-linecap", "round")
      .attr("stroke", "lime")
      .attr("fill", "none")

  var label = OrbTrjMap.Storage.Label
  for(var i=0,ln=label.length;i<ln;i++){
    OrbTrjMap.Storage.foreground_svg.selectAll("#label_dot" +i)
      .attr("cx", function(){return x_scale(Number(label[i].longitude))})
      .attr("cy", function(){return y_scale(Number(label[i].latitude))})
      .attr("r",  2.0)
      .attr("stroke-width", OrbTrjMap.Storage.stroke_width)
      .attr("fill","black")
      .attr("stroke","#00aa00")

    OrbTrjMap.Storage.foreground_svg.selectAll("#label_text" +i)
      .text(label[i].label)
      .attr("x", function(){return x_scale(Number(label[i].longitude)+label[i].label_offset[0])})
      .attr("y", function(){return y_scale(Number(label[i].latitude)+label[i].label_offset[1])})
      .attr("fill","#00aa00")
      .attr("dominant-baseline",label[i].baseline)
      .style("font-size",function() {
          var size = svg_width/90
          return  size + "px"
      })

  }


    OrbTrjMap.Storage.foreground_svg.selectAll("#cdbg")
    .attr("x", function(){return x_scale(OrbTrjMap.Default.countdown.east)})
    .attr("y", function(){return y_scale(OrbTrjMap.Default.countdown.north)})
    .attr("width",function() {
          var size = svg_width/80
          return  size*30
      })
    .attr("height",function() {
          var size = svg_width/40
          return  size*4
      })
    .attr("fill","black")
    .attr("opacity",0.8);


    OrbTrjMap.Storage.foreground_svg.selectAll("#countdown")
      .text("L-00:00:00")
      .attr("x", function(){return x_scale(OrbTrjMap.Default.countdown.east+2)})
      .attr("y", function(){return y_scale(OrbTrjMap.Default.countdown.north-3)})
      .attr("fill","#00aa00")
      .style("font-size",function() {
          var size = svg_width/40
          return  size + "px"
      })

    OrbTrjMap.Storage.foreground_svg.selectAll("#next1_sequence")
      .text("TBD")
      .attr("x", function(){return x_scale(OrbTrjMap.Default.countdown.east+2)})
      .attr("y", function(){return y_scale(OrbTrjMap.Default.countdown.north-5)})
      .attr("fill","#00aa00")
      .style("font-size",function() {
          var size = svg_width/80
          return  size + "px"
      })

    OrbTrjMap.Storage.foreground_svg.selectAll("#next2_sequence")
      .text("TBD")
      .attr("x", function(){return x_scale(OrbTrjMap.Default.countdown.east+2)})
      .attr("y", function(){return y_scale(OrbTrjMap.Default.countdown.north-7)})
      .attr("fill","#00aa00")
      .style("font-size",function() {
          var size = svg_width/80
          return  size + "px"
      })

    OrbTrjMap.Storage.foreground_svg.selectAll("#next3_sequence")
      .text("TBD")
      .attr("x", function(){return x_scale(OrbTrjMap.Default.countdown.east+2)})
      .attr("y", function(){return y_scale(OrbTrjMap.Default.countdown.north-9)})
      .attr("fill","#00aa00")
      .style("font-size",function() {
          var size = svg_width/80
          return  size + "px"
      })

  d3.select(foreground).select("#launch_vehicle")
      .attr("cx", function(){ return x_scale(Number(data[0][1]))})
      .attr("cy",  function(){ return y_scale(Number(data[0][0]))})
      .attr("r",  2.0)
      .attr("fill","lime")
}

OrbTrjMap.FindElapsedTimeValue = function(target_num){
    var value = 0.5
    var step = 0.5
    var i = 0
     do{
      var time = OrbTrjMap.Storage.elapsed_time_func(value)
      var delta = time- target_num
      if(Math.abs(delta)<0.001){break}
      if(delta>0){
        step = step/2
        value = value - step
      }else{
        value = value + step/2
      }
      i += 1
      }while(i<1000)
     return value
  }

OrbTrjMap.MidUpdator = function(){

}

OrbTrjMap.ShortUpdator = function(){
  var now = new Date();
  OrbTrjMap.Storage.now.setTime(now.getTime()+OrbTrjMap.Storage.time_offset);
  OrbTrjMap.Storage.ElapsedTime = (OrbTrjMap.Storage.now.getTime()-OrbTrjMap.Storage.launch_date.getTime())/1000

  if(OrbTrjMap.Default.abort==true){
    OrbTrjMap.AbortHook()
  }else{

  if(OrbTrjMap.Storage.now.getTime()>OrbTrjMap.Storage.orbit_insertion.getTime()){
    OrbTrjMap.OrbitInsertionHook()
  }

  var time = OrbTrjMap.Storage.ElapsedTime

  var v = OrbTrjMap.FindElapsedTimeValue(time)
  OrbTrjMap.Storage.current_latitude = OrbTrjMap.Storage.latitude_func(v)
  OrbTrjMap.Storage.current_longitude = OrbTrjMap.Storage.longitude_func(v)


    var svg_width = OrbTrjMap.Storage.window.width;
    var svg_height = OrbTrjMap.Storage.window.width/2;

  var x_scale = d3.scaleLinear()
    .domain(OrbTrjMap.Default.domain.x)
    .range([0,svg_width]);

  var y_scale = d3.scaleLinear()
    .domain(OrbTrjMap.Default.domain.y)
    .range([0,svg_height]);

    OrbTrjMap.Storage.foreground_svg.selectAll("#launch_vehicle")
      .attr("cx", function(){return x_scale(Number(OrbTrjMap.Storage.current_longitude))})
      .attr("cy",  function(){ return y_scale(Number(OrbTrjMap.Storage.current_latitude))})

  var cd = OrbTrjMap.ElapsedTime(OrbTrjMap.Storage.launch_date, OrbTrjMap.Storage.now)

  var countdown_str = "L" + cd.sign + OrbTrjMap.ZeroFill (cd.days) + ":" + OrbTrjMap.ZeroFill(cd.hours) + ":"  + OrbTrjMap.ZeroFill(cd.minutes) + ":"  + OrbTrjMap.ZeroFill(cd.seconds);
  OrbTrjMap.Storage.foreground_svg.selectAll("#countdown")
    .text(countdown_str)

  var sequence = OrbTrjMap.GetSequenceString()

  OrbTrjMap.Storage.foreground_svg.selectAll("#previous_sequence")
    .text(countdown_str)

  var next1_sequence_str  = sequence.next.time + " "+   sequence.next.label
  OrbTrjMap.Storage.foreground_svg.selectAll("#next1_sequence")
    .text(next1_sequence_str)

  var next2_sequence_str = sequence.next2.time + " "+   sequence.next2.label
  OrbTrjMap.Storage.foreground_svg.selectAll("#next2_sequence")
    .text(next2_sequence_str)

  var next3_sequence_str = sequence.next3.time + " "+   sequence.next3.label
  OrbTrjMap.Storage.foreground_svg.selectAll("#next3_sequence")
    .text(next3_sequence_str)

  var clock_zerohour = OrbTrjMap.FormatUTCDate(OrbTrjMap.Storage.launch_date)
  var clock_utc = OrbTrjMap.FormatUTCDate(OrbTrjMap.Storage.now)
  var clock_local = OrbTrjMap.FormatLocalDate(OrbTrjMap.Storage.now)

  var str = [
    '<table id="clock">',
    '<tr><td><span id="zerohour_label">Zero Hour(UTC): </span></td><td><span id="zerohour_time">'+clock_zerohour+'</span></td></tr>',
    '<tr><td>Current UTC:</td><td><span id="clock_utc">'+clock_utc+'</span></td></tr>',
    '<tr><td>Current Local:</td><td><span id="clock_local">'+clock_local+'</span></td></tr>',
    '</table>'
   ].join("\n")
  document.getElementById("indicator").innerHTML = str
  }
}

OrbTrjMap.GetSequenceString = function(){
  var now = OrbTrjMap.Storage.now
  var index = OrbTrjMap.CheckCurrentSequence();
  if(OrbTrjMap.Storage.Sequence[index]){
    var next_sequence = OrbTrjMap.Storage.Sequence[index];
    var next_to = now;
    var next_from = next_sequence.time.absolute;
    var next_et = OrbTrjMap.ElapsedTime(next_from,next_to);
    var next = {
      label:next_sequence.label,
      time:"T" + next_et.sign + OrbTrjMap.ZeroFill (next_et.days) + ":" + OrbTrjMap.ZeroFill(next_et.hours) + ":"  + OrbTrjMap.ZeroFill(next_et.minutes) + ":"  + OrbTrjMap.ZeroFill(next_et.seconds)
    }

  }else{
    var next = {
      label:"",
      time:""
    }
  }

  var show_sequence = function(sequence){
    var to = now;
    var from = sequence.time.absolute;
    var et = OrbTrjMap.ElapsedTime(from,to);
    var label = sequence.label;
    var time = "T" + et.sign + OrbTrjMap.ZeroFill (et.days) + ":" + OrbTrjMap.ZeroFill(et.hours) + ":"  + OrbTrjMap.ZeroFill(et.minutes) + ":"  + OrbTrjMap.ZeroFill(et.seconds);
    return {
      label : label,
      time: time
    }
  }
  if(OrbTrjMap.Storage.Sequence[index-1] && OrbTrjMap.Storage.Sequence[index-1].type != "comment"){
    var previous_sequence = OrbTrjMap.Storage.Sequence[index-1];
    var previous  = show_sequence(previous_sequence);
  }else if(OrbTrjMap.Storage.Sequence[index-2] && OrbTrjMap.Storage.Sequence[index-2].type != "comment" ){
    var previous_sequence = OrbTrjMap.Storage.Sequence[index-2];
    var previous  = show_sequence(previous_sequence);
 }else{
    var previous = {
      label:"",
      time:""
    }
  }

  if(OrbTrjMap.Storage.Sequence[index+1] && OrbTrjMap.Storage.Sequence[index+1].type != "comment"){
   var next2_sequence = OrbTrjMap.Storage.Sequence[index+1]
   var next2 =show_sequence(next2_sequence);
   }else if(OrbTrjMap.Storage.Sequence[index+1] && OrbTrjMap.Storage.Sequence[index+1].type == "comment" && OrbTrjMap.Storage.Sequence[index+2]){
   var next2_sequence = OrbTrjMap.Storage.Sequence[index+2];
   var next2 = show_sequence(next2_sequence);
   }else{
    var next2 = {
      label:"",
      time:""
    }
   }

  if(OrbTrjMap.Storage.Sequence[index+2] && OrbTrjMap.Storage.Sequence[index+2].type != "comment"){
   var next3_sequence = OrbTrjMap.Storage.Sequence[index+2]
   var next3 =show_sequence(next3_sequence);
   }else if(OrbTrjMap.Storage.Sequence[index+2] && OrbTrjMap.Storage.Sequence[index+2].type == "comment" && OrbTrjMap.Storage.Sequence[index+3]){
   var next3_sequence = OrbTrjMap.Storage.Sequence[index+3];
   var next3 = show_sequence(next3_sequence);
   }else{
    var next3 = {
      label:"",
      time:""
    }
   }

  return {
    previous:previous,
    next:next,
    next2,next2,
    next2,next3
  }
}

OrbTrjMap.CheckCurrentSequence = function(){
  var sq = OrbTrjMap.Storage.Sequence;
  var now = OrbTrjMap.Storage.now
  var current_timestamp = now.getTime();
  var timestamp = sq[OrbTrjMap.Storage.CurrentSequenceIndex].time.timestamp;
  if(timestamp<current_timestamp){
    var index = OrbTrjMap.GetCurrentSequenceIndex();
    OrbTrjMap.Storage.CurrentSequenceIndex = index
  }else{
    var index = OrbTrjMap.Storage.CurrentSequenceIndex;
  }
  return index
}

OrbTrjMap.GetCurrentSequenceIndex = function(){
  var data = OrbTrjMap.Storage.Sequence;
  var now = OrbTrjMap.Storage.now
  var current_timestamp = now.getTime();
  var index =0;
  for(var i=0, ln = data.length; i<ln;i++){
    if(data[i].type !="comment"){
    var timestamp = data[i].time.timestamp;
    index = i;
    if(timestamp>current_timestamp){
      break;
    }
    }
  }
  return index
}

OrbTrjMap.TimeToRelative= function(str,tz){
  var time = OrbTrjMap.DecodeDateString(str,tz)
  var zerohour = OrbTrjMap.Storage.zerohour;
  var cd = OrbTrjMap.ElapsedTime (zerohour,time);
    return cd.sign + OrbTrjMap.ZeroFill (cd.days) + ":" + OrbTrjMap.ZeroFill (cd.hours) + ":"  + OrbTrjMap.ZeroFill (cd.minutes) + ":"  + OrbTrjMap.ZeroFill (cd.seconds)
}

OrbTrjMap.TimeToAbsolute= function(str){
  var t = str.split(":");
  var seconds = Math.abs(Number(t[0]))*86400 +Number(t[1])*3600 + Number(t[2])*60 + Number(t[3]);
  if(t[0].charAt(0)=="-"){
  seconds = 0-Math.abs(seconds);
  }
  var zerohour = OrbTrjMap.Storage.zerohour;
  var time = new Date();
  time.setTime(zerohour.getTime() + (seconds * 1000));
  return time;
}

OrbTrjMap.DecodeSequence= function(data){
var list = data.sequence;
var results = []
for(var i=0, ln = list.length; i<ln;i++){
var type = list[i].type;
var time = list[i].time;
if(type=="absolute"){
  var relative = OrbTrjMap.TimeToRelative(time);
  var absolute = OrbTrjMap.DecodeDateString(time,data.tz.num);
  var label = list[i].label;
  var timestamp = absolute.getTime()
}else if(type=="relative"){
  if(time.charAt(0)!="-"){
  var sign="+"
  }else{
  var sign = ""
  }
  var relative = sign + time
  var absolute = OrbTrjMap.TimeToAbsolute(time);
  var label = list[i].label;
  var timestamp = absolute.getTime()
}else if(type == "comment"){
  var relative = "none"
  var absolute = "none"
  var label = list[i].label;
  var timestamp = "none"
}
results.push({
"type":type,
"time":{
  "timestamp":timestamp,
  "relative":relative,
  "absolute":absolute
},
"label":label
});
}
return results;
}

 OrbTrjMap.ShowMessagePanel = function(msg){
    var perent_obj = document.getElementsByTagName("body")[0];
    var msg_element = document.createElement('div');
    msg_element.id="message_panel";
    msg_element.setAttribute('id', "message_panel");
    msg_element.className = "fadein"
    var msg_style = msg_element.style;
    msg_style.cssText  += 'filter: alpha(opacity=80); -moz-opacity:0.80; opacity:0.80;';
    msg_style.position = 'absolute';
    msg_style.backgroundColor = '#000';
    msg_style.left = "60px";
    msg_style.top = OrbTrjMap.Storage.window.height/4 + "px";
    msg_style.right = "60px";
    //msg_style.bottom = OrbTrjMap.Storage.window.height/3.5 + "px";
    msg_style.zIndex = '600';
    perent_obj.appendChild(msg_element);
    var str='<div id="message_panel_header"><p id="message_panel_close"><img src="./image/close_icon.png"></p></div>\n<div id="message_panel_body" class="scrollable">'+msg+'</div>'
   msg_element.innerHTML = str
   document.getElementById("message_panel_close").addEventListener('click',OrbTrjMap.CloseMessagePanel,false);
}
  OrbTrjMap.CloseMessagePanel = function(){
       var msg = document.getElementById("message_panel");
       var perent_obj =  msg.parentNode;
       perent_obj.removeChild(msg);
       OrbTrjMap.Storage.ConfigPanel = false
  }

 OrbTrjMap.ToggleMessagePanel = function(event){
    if(OrbTrjMap.Storage.MessagePanel == false){
      OrbTrjMap.ShowMessagePanel()
      OrbTrjMap.MessagePanel = true
    }else{
      OrbTrjMap.CloseMessagePanel()
      OrbTrjMap.Storage.MessagePanel = false
    }
  }

 OrbTrjMap.ShowConfigPanel = function(){
    var perent_obj = document.getElementsByTagName("body")[0];
    var cf_element = document.createElement('div');
    cf_element.id="config_panel";
    cf_element.setAttribute('id', "config_panel");
    var cfstyle = cf_element.style;
     cfstyle.cssText  += 'filter: alpha(opacity=80); -moz-opacity:0.80; opacity:0.80;';
      cfstyle.position = 'absolute';
      cfstyle.backgroundColor = '#000';
      cfstyle.left = "30px";
      cfstyle.top = "30px";
      cfstyle.right = "30px";
      cfstyle.bottom = "30px";
      cfstyle.zIndex = '600';
      perent_obj.appendChild(cf_element);
      var str='<div id="config_panel_header">' + OrbTrjMap.ConfigPanelItems.header + '</div>\n<div id="config_panel_body" class="scrollable"></div>'
      cf_element.innerHTML = str
      OrbTrjMap.SwitchConfigPanel.Timeline()
      document.getElementById("config_panel_close").addEventListener('click',OrbTrjMap.CloseConfigPanel,false);
      document.getElementById("config_panel_info").addEventListener('click',OrbTrjMap.SwitchConfigPanel.Info,false);
      document.getElementById("config_panel_timeline").addEventListener('click',OrbTrjMap.SwitchConfigPanel.Timeline,false);
      OrbTrjMap.Storage.ConfigPanel = true
  }

 OrbTrjMap.CloseConfigPanel = function(){
       var conf = document.getElementById("config_panel");
       var perent_obj =  conf.parentNode;
       perent_obj.removeChild(conf);
       OrbTrjMap.Storage.ConfigPanel = false
  }

 OrbTrjMap.ToggleConfigPanel = function(event){
    if(OrbTrjMap.Storage.ConfigPanel == false){
      OrbTrjMap.ShowConfigPanel()
      OrbTrjMap.ConfigPanel = true
    }else{
      OrbTrjMap.CloseConfigPanel()
      OrbTrjMap.Storage.ConfigPanel = false
    }
  }

OrbTrjMap.SwitchConfigPanel = {
    Info:function(){
       var body_target = "info"
       var str= OrbTrjMap.ConfigPanelItems[body_target] +OrbTrjMap.ConfigPanelItems["copyright"]
      document.getElementById("config_panel_body").innerHTML = str
    },
    Timeline:function(){
      document.getElementById("config_panel_body").innerHTML = OrbTrjMap.ConfigPanelItems["timeline"];
      var sequence = OrbTrjMap.DecodeSequence(OrbTrjMap.Sequence)
      var html = []
      html.push("<table>")
      html.push("<tr><td style='font-size:small'><strong>Events</strong></td><td style='white-space:nowrap;font-size:small'><strong>Countdown</strong></td><td style='white-space:nowrap;font-size:small'><strong>UTC</strong></td><td style='white-space:nowrap;font-size:small'><strong>Local</strong></td></tr>")
      for(var i=0,ln=sequence.length;i<ln;i++){
        var utc = OrbTrjMap.FormatUTCDate(sequence[i].time.absolute)
        var local =OrbTrjMap.FormatLocalDate(sequence[i].time.absolute)
        var str =  "<tr><td style='font-size:small'>" +sequence[i].label+ "</td><td style='white-space:nowrap;font-size:small'>T" +sequence[i].time.relative + "</td><td style='white-space:nowrap;font-size:small'>" +utc + "</td><td style='white-space:nowrap;font-size:small'>" +local + "</td></tr>"
        html.push(str)
      }
      html.push("</table>");
      for(var i=0, ln=OrbTrjMap.Sequence.source.length;i<ln;i++ ){
        html.push("<p style='font-size:x-small'>ref. <a href='"+OrbTrjMap.Sequence.source[i].url+"' target='_blank'>"+OrbTrjMap.Sequence.source[i].title+"</a></p>")
        document.getElementById("event_timeline").innerHTML = html.join("\n")
      }
    }
  }

  OrbTrjMap.ConfigPanelItems = {
  "header": '<p id="config_panel_close"><img src="./image/close_icon.png"></p><p id="config_icons"><div id="config_panel_timeline"><img src="./image/clock_icon.png" /></div><div id="config_panel_info"><img src="./image/info_icon.png" /></div></p>',
  "info":"<p><strong>Launch Trajectory</strong></p><p><strong><em>Please note. This is NOT a product of NASA, ESA, JAXA or any agencies or companies. The position of the launch vehicle/spacecraft is an estimation based on the information provided prior to the launch.</em></strong></p>",
  "copyright":"<p><strong>Copyright (c) 2016 Isana Kashiwai</strong></p><p>This software includes <a href='https://d3js.org/'>D3.js</a>, <a href='http://www.JSON.org/js.html'>JSON2.js</a> and <a href='http://www.lizard-tail.com/isana/lab/orb/'>Orb.js</a> libraries.</p><p><strong>Administrator: </strong><br/>Isana Kashiwai (isana.k  at gmail.com)<br/>Twitter: @lizard_isana</p><p><strong>PLEASE DO NOT USE THIS APP INSIDE IFRAME OR OTHER APPLICATION.</strong><br/>This application is not intended to work properly inside the iframe or any application. And also our web server has the strict limitation of data trafic. If it exceeds these limits, the service must be closed. So please don\'t.</p>",
  "timeline":'<div id="event_timeline"></div>'
  }


window.onload = function(){
  OrbTrjMap.Initialize();
}

window.onresize = function(){
  OrbTrjMap.Storage.window = OrbTrjMap.GetWindowSize()
  OrbTrjMap.UpdateMap()

}


OrbTrjMap.OrbitInsertionHook = function(){
   if(OrbTrjMap.Storage.orbit_insertion_flag == false){
   var orbit_insertion_message = OrbTrjMap.DataLoader({
        "path":"./orbit_insertion_h2af35.txt?nocache=" + new Date().getTime(),
        "ajax":false
      })
     OrbTrjMap.ShowMessagePanel(orbit_insertion_message)
     OrbTrjMap.Storage.orbit_insertion_flag = true
   }
  return false
}

OrbTrjMap.AbortHook = function(){
  if(OrbTrjMap.Storage.abort_message_flag == false){
    OrbTrjMap.ShowMessagePanel(OrbTrjMap.Default.abort_message)
    OrbTrjMap.Storage.abort_message_flag = true
  }
  return false
}


//NOTE:
//Latitudes and longitudes are not exact position of events but b-spline anchor points for the line.
//{elapsed_time:0, latitude:0, longitude:0, altitude:0, velocity:0, label:"text", (label_offset:[x,y]), (baseline:"<dominant-baseline properties>")},

OrbTrjMap.Trajectory = [
  {elapsed_time:0, latitude:30.40, longitude:130.97, altitude:"none", velocity:"none", label:"リフトオフ",label_offset:[-4,-1.5], baseline:"text-before-edge"},
  {elapsed_time:245, latitude:30.20, longitude:132.0, altitude:"none", velocity:"none", label:"衛星フェアリング分離",label_offset:[0,2.0]},
  {elapsed_time:396, latitude:29.5, longitude:140.5, altitude:"none", velocity:"none", label:"第1段主エンジン燃焼停止（MECO）",label_offset:[2,0]},
  {elapsed_time:732, latitude:27.0, longitude:157.0, altitude:"none", velocity:"none", label:"第 2 段エンジン第 1 回燃焼停止（SECO1）"},
  {elapsed_time:1430, latitude:7.0, longitude:-160.5, altitude:"none", velocity:"none", label:"第 2 段エンジン第 2 回始動（SEIG2）"},
  {elapsed_time:1627, latitude:-2.0, longitude:-145.0, altitude:"none", velocity:"none", label:"第 2 段エンジン第 2 回燃焼停止（SECO2）",label_offset:[-2.0,2.0]},
  {elapsed_time:1677, latitude:-3.5, longitude:-141.0, altitude:"none", velocity:"none", label:"みちびき 3 号機分離",label_offset:[1,0]}
]

var  launch_date = new Date(Date.UTC(2017, 7, 19, 5, 29, 00))
var orbit_insertion = new Date()
orbit_insertion.setTime(launch_date.getTime()+1720*1000)

OrbTrjMap.Default = {
  "launch_date": launch_date,
  "orbit_insertion": orbit_insertion,
  "projection": {
    "scale":3,
    "center":[0,20],
    "rotate":[180,0]
  },
  "domain":{
  "x":[120, 240],
  "y":[50, -10]
  },
  "cross":{
    "step":10,
    "size":0.4
  },
  "countdown":{
   "north": 10,
   "east": 130
  },
  "abort":false,
  "abort_message":"<div style='text-align:center'><!--<p><strong>Launch Abort!</strong></p>--><p>8月12日に予定されていたH-2A 35号機の打上げは中止されました。<br/>新しい打ち上げ予定が発表され次第更新します。</p></div>"
}


OrbTrjMap.Sequence = {
  "title":"H-IIA F35 / MICHIBIKI3 Launch Countdown",
  "tz":{
    "num":0,
    "label":"UTC"
  },
  "zerohour":{
    "label":"Launch",
    "time":"2017-08-19 05:29:00"
  },
  "sequence":[
    {"type":"relative", "time":"00:00:00:00.0", "label":"リフトオフ"},
    {"type":"relative", "time":"00:00:01:48.0", "label":"固体ロケットブースタ 燃焼終了"},
    {"type":"relative", "time":"00:00:02:06.0", "label":"固体ロケットブースタ第1ペア 分離"},
    {"type":"relative", "time":"00:00:02:09.0", "label":"固体ロケットブースタ第2ペア 分離"},
    {"type":"relative", "time":"00:00:03:45.0", "label":"衛星フェアリング分離"},
    {"type":"relative", "time":"00:00:06:38.0", "label":"第1段主エンジン燃焼停止（MECO）"},
    {"type":"relative", "time":"00:00:06:46.0", "label":"第1段・第2段分離 "},
    {"type":"relative", "time":"00:00:06:52.0", "label":"第2段エンジン第1回始動（SEIG1）"},
    {"type":"relative", "time":"00:00:11:23.0", "label":"第 2 段エンジン第 1 回燃焼停止（SECO1） "},
    {"type":"relative", "time":"00:00:23:39.0", "label":"第 2 段エンジン第 2 回始動（SEIG2）"},
    {"type":"relative", "time":"00:00:27:49.0", "label":"第 2 段エンジン第 2 回燃焼停止（SECO2）"},
    {"type":"relative", "time":"00:00:28:40.0", "label":"みちびき3号機分離"}
  ],
  "source":[
    {"url":"http://www.jaxa.jp/press/2017/06/files/20170615_h2af35_j","title":"平成29年度 ロケット打上げ計画書「みちびき3号機」（準天頂衛星システム　静止軌道衛星）／H-IIAロケット35号機（H-IIA・F35）*PDF"}
  ]
}
// http://www.ulalaunch.com/uploads/docs/Mission_Booklets/AV/av_osirisrex_mob.pdf

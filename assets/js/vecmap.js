
class VecMap {
  constructor(config) {
    this.PostMapLoadHook = [];
    this.PostMapDataLoadHook = [];

    if (config.map) {
      this.map = config.map;
      if (config.detail) {
        this.detail = config.detail;
      } else {
        this.detail = 'mid';
      }
    }
    this.json = config.topojson;
    this.element = config.element;
    this.width = config.width;
    this.height = config.height;
    this.center = config.center;

    if (config.responsive) {
      this.responsive = config.responsive;
    } else {
      this.responsive = false;
    }
    if (config.scale) {
      this.scale = config.scale;
    } else {
      this.scale = 1.0
    }
    if (config.filter) {
      this.filter = config.filter
    }
    if (config.marker) {
      this.marker = config.marker
    }
    if (config.offset) {
      this.offset = config.offset
    } else {
      this.offset = {
        x: 0,
        y: 0
      }
    }
    if (config.projection) {
      this.projection = config.projection;
    } else {
      this.projection = "Mercator"
    }
  }

  add_post_map_data_load_hook = function (f) {
    this.PostMapDataLoadHook.push(f);
  };

  post_map_data_load_hook = (f) => {
    this.add_post_map_data_load_hook(f);
  }

  add_post_map_load_hook = function (f) {
    this.PostMapLoadHook.push(f);
  };

  post_map_load_hook = (f) => {
    this.add_post_map_load_hook(f);
  }

  async init() {
    let geodata = {};
    if (this.map) {
      let MODULE = await import(`./map/${this.map}.${this.detail}.js`);
      geodata.data = MODULE.MAP_DATA;
      geodata.object = MODULE.MAP_CONF.object;
    } else if (this.json) {
      geodata.data = await d3.json(this.json.file);
      geodata.object = this.json.object;
    }

    geodata.data = topojson.feature(geodata.data, geodata.data.objects[geodata.object]);

    if (this.filter) {
      geodata.data.features = geodata.data.features.filter((d) => {
        if (d.properties[this.filter.key]) {
          return d.properties[this.filter.key] == this.filter.value;
        }
      })
    }

    if (this.PostMapDataLoadHook.length > 0) {
      for (var i in this.PostMapDataLoadHook) {
        geodata.data = this.PostMapDataLoadHook[i](geodata.data);
      }
    }

    let projection;
    if (this.projection) {
      switch (this.projection) {
        case 'Mercator':
          projection = d3.geoMercator()
          break
        case 'Equirectangular':
          projection = d3.geoEquirectangular()
          break
        case 'AzimuthalEquidistant':
          projection = d3.geoAzimuthalEquidistant()
          break
        case 'AzimuthalEqualArea':
          projection = d3.geoAzimuthalEqualArea()
          break
        case 'Orthographic':
          projection = d3.geoOrthographic()
          break
      }
    } else {
      projection = d3.geoMercator()
    }

    const geopath = d3.geoPath().projection(projection);

    projection.scale(1).translate([0, 0]);
    var b = geopath.bounds(geodata.data)
    var s = 1.0 / Math.max((b[1][0] - b[0][0]) / this.width, (b[1][1] - b[0][1]) / this.height) * this.scale;
    let center;
    if (this.center) {
      center = this.center
    } else {
      var bounds = d3.geoBounds(geodata.data);
      center = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
    }

    projection
      .scale(s)
      .translate([this.width / 2 + this.offset.x, this.height / 2 + this.offset.y])
      .rotate([0 - center[0], 0 - center[1]]);

    let map = d3.select(this.element);
    let svg = map.append(`svg`)
    if (this.responsive) {
      svg.attr(`viewBox`, `0 0 ${this.width} ${this.height}`)
    } else {
      svg.attr(`viewBox`, `0 0 ${this.width} ${this.height}`)
        .attr(`width`, `${this.width}px`)
        .attr(`height`, `${this.height}px`);
    }

    svg.selectAll(".region")
      .data(geodata.data.features)
      .enter()
      .append(`path`)
      .attr("class", function (d) {
        let str;
        if (d.properties.name) {
          str = d.properties.name;
          str =  str.replace(/(\.|\')/g, '').replace(/( )/g, '_').toLowerCase();
          if(geodata.object == 'japan') {
            str = str.replace(/(_do)/g, 'do').replace(/(_)(.*)/g, '').toLowerCase();
          }
        }
        return "region " + str;
      })
      .attr(`data-id`, function(d){
        if(geodata.object == 'japan') {
          return d.properties.id;
        }
        return "";
      })
      .attr(`data-name`, function(d){
        return d.properties.name;
      })
      .attr(`data-name_ja`, function(d){
        if(geodata.object == 'japan') {
          return d.properties.name_ja;
        }
        return "";
      })
      .attr(`d`, geopath)
      .attr(`stroke`, `#c4c4c4`)
      .attr(`stroke-width`, 0.25)
      .attr(`fill`, `#c4c4c4`)

    // The 'Maldives' in 10m topojson data is probably broken. So remove it from svg.
    /*
    if (this.map && this.map == 'world' && this.detail == 'high') {
      svg.selectAll(".region").filter('.maldives').remove()
    }
    */

    if (this.marker) {
      let default_marker;
      const marker_image_array = [];
      if (this.marker.image) {
        default_marker = await d3.xml(this.marker.image);
      } else {
        const xmlstr = '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7"><g fill="#bbb" stroke="#707070" stroke-width="1"><circle cx="3.5" cy="3.5" r="3.5" stroke="none"/><circle cx="3.5" cy="3.5" r="3" fill="none"/></g></svg>';
        var parser = new DOMParser();
        default_marker = parser.parseFromString(xmlstr, "text/xml");
      }
      marker_image_array.push(default_marker);

      let marker_offset;
      if (this.marker.offset) {
        marker_offset = {
          x: Number(this.marker.offset.x),
          y: Number(this.marker.offset.y)
        }
      } else {
        marker_offset = {
          x: 3.5,
          y: 3.5
        }
      }
      let marker_scale;
      if (this.marker.scale) {
        marker_scale = Number(this.marker.scale);
      } else {
        marker_scale = 1.0
      }

      this.marker.list.forEach(async (item, index) => {

        let marker_image;
        if (item["image"]) {
          let marker_image_index = marker_image_array.indexOf(item["image"]);
          if (marker_image_index < 0) {
            marker_image = await d3.xml(item["image"]);
            marker_image_array.push(marker_image);
          } else {
            marker_image = marker_image_array[marker_image_index];
          }
        } else {
          marker_image = marker_image_array[0];
        }
        let tmp_scale = 1;
        if (item['scale']) {
          tmp_scale = Number(item['scale']);
        } else {
          tmp_scale = marker_scale;
        }

        if (item['offset']) {
          marker_offset.x = marker_offset.x + item['offset'].x;
          marker_offset.y = marker_offset.y + item['offset'].y;
        }
        svg.append("g")
          .attr('id', `${item["id"]}`)
          .attr('class', function () {
            if (item['class']) {
              return `${item["class"]}`
            } else {
              return 'marker';
            }
          })
          .attr('transform', `scale(${tmp_scale},${tmp_scale})`)
          .on('click', (event) => {
            this.marker.click(event);
          })
          .node().appendChild(marker_image.documentElement.cloneNode(true));

        map.select(`#${item["id"]} svg`)
          .attr('class', 'marker')
          .attr('x', function () {
            return (projection([item["longitude"], item["latitude"]])[0] + marker_offset.x * tmp_scale) / tmp_scale;
          })
          .attr('y', function () {
            return (projection([item["longitude"], item["latitude"]])[1] + marker_offset.y * tmp_scale) / tmp_scale;
          })


      })
    }

    if (this.PostMapLoadHook.length > 0) {
      for (var i in this.PostMapLoadHook) {
        this.PostMapLoadHook[i]();
      }
    }

  }

}

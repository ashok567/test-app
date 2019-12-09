/* eslint-disable space-before-blocks */
$('body').tooltip({ selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade' })

var margin = { top: 20, right: 160, bottom: 35, left: 30 }

var width = 600 - margin.left - margin.right
var height = 450 - margin.top - margin.bottom

$(document).ready(function (){
  $.ajax({
    type: 'GET',
    url: '/data'
  })
    .done(function (data){
      var months = _.uniq(_.map(data.response, 'Month'))
      var channels = _.pull(_.keys(data.response[0]), 'Month')
      var colors = ['#66c2a5', '#D2691E', '#DAA520', '#8da0cb', '#a6d854', '#e78ac3']

      var stack = d3.stack().keys(channels)
      var dataset = stack(data.response)

      var svg = d3.selectAll('#canvas1')
        .append('svg').attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 600 520').classed('svg-content', true)
        .append('g')
        .attr('transform', 'translate(' + 2 * margin.left + ',' + 2 * margin.top + ')')

      var x = d3.scaleBand()
        .domain(months.map(function (d) { return d }))
        .range([10, width - 10], 0.02)

      var y = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d[1] }) })])
        .range([height, 0])

      // Define and draw axes
      var yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat(function (d) { return d })

      var xAxis = d3.axisBottom(x)

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      var groups = svg.selectAll('g.cost')
        .data(dataset)
        .enter().append('g')
        .attr('class', 'cost')
        .style('fill', function (d, i) { return colors[i] })

      groups.selectAll('rect')
        .data(function (d) { return d })
        .enter()
        .append('rect')
        .attr('x', function (d) { return x(d.data.Month) })
        .attr('y', function (d) { if (!isNaN(d[1])) return y(d[1]) })
        .attr('height', function (d) { if (!isNaN(d[1])) return y(d[0]) - y(d[1]) })
        .attr('width', x.bandwidth() - 5)
        .attr('data-placement', 'right')
        .attr('data-toggle', 'popover')
        .attr('data-title', function (d){
          return d[1] - d[0]
        })
    })
    .fail(function (error) {
      alert(error)
    })
})

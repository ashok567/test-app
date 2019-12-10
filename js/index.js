/* eslint-disable space-before-blocks */
$('body').tooltip({ selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade' })

var margin = { top: 50, right: 10, bottom: 10, left: 50 }

var width = 600 - margin.left - margin.right
var height = 400 - margin.top - margin.bottom

var svg = d3.selectAll('#canvas1').append('svg').attr('width', 700).attr('height', 500)
  // .attr('preserveAspectRatio', 'xMinYMin meet')
  // .attr('viewBox', '0 0 600 520').classed('svg-content', true)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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

      console.log(dataset)

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
        .attr('x', function (d) { return x(d.data.Month) + 10 })
        .attr('y', function (d) { if (!isNaN(d[1])) return y(d[1]) })
        .attr('height', function (d) { if (!isNaN(d[1])) return y(d[0]) - y(d[1]) })
        .attr('width', 30)
        .attr('data-placement', 'right')
        .attr('data-toggle', 'popover')
        .attr('data-title', function (d){
          return d[1] - d[0]
        })

      svg.append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'end')
        .attr('x', -180)
        .attr('y', -40)
        .attr('font-size', '16')
        .attr('dy', '.35em')
        .attr('transform', 'rotate(-90)')
        .text('Subscribers')

      svg.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .attr('font-size', '16')
        .attr('dy', '.35em')
        .text('Months')

      // Draw legend
      var legend = svg.selectAll('.legend')
        .data(colors)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) { return 'translate(10,' + i * 20 + ')' })

      legend.append('rect')
        .attr('x', width + 10)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function (d, i) { return colors[i] })

      legend.append('text')
        .attr('x', width + 36)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .style('font', '10px sans-serif')
        .text(function (d, i) {
          switch (i) {
            case 0: return channels[0]
            case 1: return channels[1]
            case 2: return channels[2]
            case 3: return channels[3]
            case 4: return channels[4]
            case 5: return channels[5]
          }
        })
    })
    .fail(function (error) {
      alert(error)
    })
})

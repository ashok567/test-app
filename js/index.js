/* eslint-disable space-before-blocks */
$('body').tooltip({ selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade' })

var margin = { top: 50, right: 10, bottom: 10, left: 60 }

var width = 600 - margin.left - margin.right
var height = 400 - margin.top - margin.bottom

var svg = d3.selectAll('#canvas1').append('svg').attr('width', 700).attr('height', 480)
  // .attr('preserveAspectRatio', 'xMinYMin meet')
  // .attr('viewBox', '0 0 600 520').classed('svg-content', true)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

$(document).ready(function (){
  $.ajax({
    type: 'GET',
    url: '/subs'
  })
    .done(function (data){
      var months = _.uniq(_.map(data.response, 'Month'))
      var channels = _.pull(_.keys(data.response[0]), 'Month')
      var colors = ['#66c2a5', '#D2691E', '#FFD700', '#8da0cb', '#a6d854', '#e78ac3']
      var mainColors = {}
      _.each(channels, function (d, i) { mainColors[d] = colors[i] })

      var stack = d3.stack().keys(channels)
      var dataset = stack(data.response)

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
        .attr('x', -100)
        .attr('y', -40)
        .attr('font-size', '16')
        .attr('dy', '.35em')
        .attr('transform', 'rotate(-90)')
        .text('Subscribers (in mn)')

      svg.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 50)
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
        .style('font', '11px sans-serif')
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

      $.get('/views', function (data1){
        var dataset1 = data1.response

        var margin1 = { top: 20, right: 10, bottom: 10, left: 40 }

        var width1 = 400 - margin1.left - margin1.right
        var height1 = 400 - margin1.top - margin1.bottom

        var svg1 = d3.selectAll('#canvas2')
          .append('svg')
          .attr('width', 400)
          .attr('height', 450)
          .append('g')
          .attr('transform', 'translate(' + margin1.left + ',' + margin1.top + ')')

        var x1 = d3.scaleBand()
          .domain(months.map(function (d) { return d }))
          .range([10, width1 - 10], 0.02)

        var y1 = d3.scaleLinear()
          .domain([0, d3.max(Object.values(dataset1), (d) => { return d3.max(Object.values(d)) })])
          .range([height1, 0])

        var xaxis = d3.axisBottom(x1)

        var yaxis = d3.axisLeft(y1).tickSize(-width1, 0, 0).tickFormat(function (d) { return d })

        svg1.append('g').attr('class', 'y axis').call(yaxis)

        svg1.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height1 + ')').call(xaxis)

        _.each(dataset1, (data, i) => {
          var line = d3.line().x((d) => { return x1(d[0]) + x1.bandwidth() / 2 }).y((d) => { return y1(d[1]) })
          svg1.append('path').datum(Object.entries(data)).attr('d', line).attr('class', 'line').attr('stroke', mainColors[i])

          svg1.selectAll()
            .data(Object.entries(data))
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', function (d) { return x1(d[0]) + x1.bandwidth() / 2 })
            .attr('cy', function (d) { return y1(d[1]) })
            .attr('r', 3)
            .attr('fill', mainColors[i])
            .attr('data-placement', 'right')
            .attr('data-toggle', 'popover')
            .attr('data-title', function (d){
              return d
            })
        })

        svg1.append('text')
          .attr('class', 'y label')
          .attr('text-anchor', 'end')
          .attr('x', -120)
          .attr('y', -30)
          .attr('font-size', '16')
          .attr('dy', '.35em')
          .attr('transform', 'rotate(-90)')
          .text('Views (in mn)')

        svg1.append('text')
          .attr('class', 'x label')
          .attr('text-anchor', 'middle')
          .attr('x', width1 / 2)
          .attr('y', height1 + 50)
          .attr('font-size', '16')
          .attr('dy', '.35em')
          .text('Months')
      })

      var channel = 'Pewdiepie'
      var channelData = _.map(data.response, (d) => _.pick(d, ['Month', channel]))

      var width2 = 250
      var height2 = 370
      var margin2 = { top: 20, right: 20, bottom: 30, left: 40 }

      var yscale2 = d3.scaleBand().domain(months.map((d) => { return d })).range([0, height2]).padding(0.2)

      var xscale2 = d3.scaleLinear().domain([0, d3.max(channelData, (d) => { return d[channel] })]).range([0, width2])

      var xaxis2 = d3.axisBottom(xscale2)
        .tickSize(-370, 0, 0)
        .tickFormat(function (d) { return d })

      var yaxis2 = d3.axisLeft(yscale2).tickSize(0)

      var svg2 = d3.selectAll('#canvas3').append('svg')
        .attr('width', 400).attr('height', 480)

      svg2.append('g')
        .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')

      svg2.append('g')
        .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')
        .call(yaxis2)

      svg2.append('g')
        .attr('transform', 'translate(' + margin2.left + ',' + (height2 + margin2.top) + ')')
        .call(xaxis2)

      svg2.selectAll('rect')
        .data(channelData)
        .enter()
        .append('rect')
        .attr('x', margin2.left)
        .attr('height', yscale2.bandwidth())
        .attr('y', function (d) { return yscale2(d.Month) + margin2.top })
        .attr('width', function (d) { return xscale2(d[channel]) })
        .attr('fill', '#41f46e')
        .attr('data-placement', 'right')
        .attr('data-toggle', 'popover')
        .attr('data-title', function (d){
          return d[1]
        })

      svg2.selectAll()
        .data(channelData)
        .enter()
        .append('text')
        .attr('x', function (d) { return xscale2(d[channel]) + margin2.left })
        .attr('y', function (d) { return yscale2(d.Month) + margin2.bottom })
        .attr('dy', '.35em')
        .style('font-size', '12')
        .text(function (d) { return d.User })

      svg2.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'end')
        .attr('x', width2 + 10)
        .attr('y', height2 + 65)
        .attr('font-size', '16')
        .attr('dy', '.35em')
        .text('Subscribers (in mn)')
    })
    .fail(function (error) {
      alert(error)
    })
})

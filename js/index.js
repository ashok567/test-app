/* eslint-disable space-before-blocks */
$(window).on('load', function (){ $('.loader').fadeOut('slow') })

$('body').tooltip({ selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade' })

const margin = { top: 50, right: 10, bottom: 10, left: 60 }

const width = 600 - margin.left - margin.right
const height = 400 - margin.top

const svg = d3.selectAll('#canvas1').append('svg').attr('width', 600).attr('height', 480)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

$(document).ready(function (){
  $('body').show()
  $('.loader').show()
  $.ajax({
    type: 'GET',
    url: '/subs'
  })
    .done(function (data){
      const months = _.uniq(_.map(data.response, 'Month'))
      const channels = _.pull(_.keys(data.response[0]), 'Month')
      const colors = ['#DC3545', '#5be147', '#ecab00', '#f21aff', '#1993D0', '#635d58']
      const mainColors = {}
      _.each(channels, function (d, i) { mainColors[d] = colors[i] })

      const btnTmpl = _.template($('#channel-btn-script').html())
      const tmplHtml = btnTmpl({ btnName: channels, btnColor: mainColors })
      $('#channel-btn-group').html(tmplHtml)

      const stack = d3.stack().keys(channels)
      const dataset = stack(data.response)

      const x = d3.scaleBand()
        .domain(months.map(function (d) { return d }))
        .range([10, width - 10], 0.02)

      const y = d3.scaleLinear()
        .domain([0, d3.max(dataset, function (d) { return d3.max(d, function (d) { return d[1] }) })])
        .range([height, 0])

      // Define and draw axes
      const yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width, 0, 0)
        .tickFormat(function (d) { return d })

      const xAxis = d3.axisBottom(x)

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      const groups = svg.selectAll('g.cost')
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
        .attr('data-title', (d) => (d[1] - d[0]).toFixed(2))

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

      $.get('/views', function (data1){
        const dataset1 = data1.response

        const margin1 = { top: 20, right: 10, bottom: 10, left: 60 }

        const width1 = 400 - margin1.left - (2 * margin1.right)
        const height1 = 400 - margin1.top - margin1.bottom

        const svg1 = d3.selectAll('#canvas2')
          .append('svg')
          .attr('width', 400)
          .attr('height', 450)
          .append('g')
          .attr('transform', 'translate(' + margin1.left + ',' + margin1.top + ')')

        const x1 = d3.scaleBand()
          .domain(months.map(function (d) { return d }))
          .range([10, width1 - 10], 0.02)

        const y1 = d3.scaleLinear()
          .domain([0, d3.max(Object.values(dataset1), (d) => { return d3.max(Object.values(d)) })])
          .range([height1, 0])

        const xaxis = d3.axisBottom(x1)

        const yaxis = d3.axisLeft(y1).tickSize(-width1, 0, 0).tickFormat(function (d) { return d })

        svg1.append('g').attr('class', 'y axis').call(yaxis)

        svg1.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height1 + ')').call(xaxis)

        _.each(dataset1, (data, i) => {
          const line = d3.line().x((d) => { return x1(d[0]) + x1.bandwidth() / 2 }).y((d) => { return y1(d[1]) })
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
            .attr('data-title', (d) => d[1])
        })

        svg1.append('text')
          .attr('class', 'y label')
          .attr('text-anchor', 'end')
          .attr('x', -120)
          .attr('y', -30)
          .attr('font-size', '16')
          .attr('dy', '.35em')
          .attr('transform', 'rotate(-90)')
          .text('Total Views (in bn)')

        svg1.append('text')
          .attr('class', 'x label')
          .attr('text-anchor', 'middle')
          .attr('x', width1 / 2)
          .attr('y', height1 + 50)
          .attr('font-size', '16')
          .attr('dy', '.35em')
          .text('Months')
      })
      channelWiseSubs(data, channels[0])

      $.get('/insights', function (data){
        data = data.response
        const insightTmpl = _.template($('#yt-insights').html())
        const tmplHtml = insightTmpl({ subsChannels: data.most_subs, viewChannels: data.most_views })
        $('#insights').html(tmplHtml)
      })
    })
    .fail(function (error) {
      alert(error)
    })
})

$(document).on('click', '.btn', function (){
  const channel = $(this).text()
  $.get('/subs', function (data){
    channelWiseSubs(data, channel)
  })
})

function channelWiseSubs (data, channel){
  $('#canvas3').empty()
  const months = _.uniq(_.map(data.response, 'Month'))
  const channels = _.pull(_.keys(data.response[0]), 'Month')
  const colors = ['#DC3545', '#5be147', '#ecab00', '#f21aff', '#1993D0', '#635d58']
  const mainColors = {}
  const width2 = 300
  const height2 = 370
  const margin2 = { top: 20, right: 10, bottom: 20, left: 30 }

  _.each(channels, function (d, i) { mainColors[d] = colors[i] })

  const channelData = _.map(data.response, (d) => _.pick(d, ['Month', channel]))

  const yscale2 = d3.scaleBand().domain(months.map((d) => { return d })).range([0, height2]).padding(0.2)

  const xscale2 = d3.scaleLinear().domain([0, 120]).range([0, width2])

  const xaxis2 = d3.axisBottom(xscale2)
    .tickSize(-370, 0, 0)
    .tickFormat(function (d) { return d })

  const yaxis2 = d3.axisLeft(yscale2).tickSize(0)

  const svg2 = d3.selectAll('#canvas3').append('svg')
    .attr('width', 400).attr('height', 480)

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
    .attr('fill', mainColors[channel])

  svg2.selectAll()
    .data(channelData)
    .enter()
    .append('text')
    .attr('x', function (d) { return xscale2(d[channel]) + 30 })
    .attr('y', function (d) { return yscale2(d.Month) + 30 })
    .attr('dy', '.35em')
    .style('font-size', '12')
    .text(function (d) { return d[channel] })

  svg2.append('text')
    .attr('class', 'x label')
    .attr('text-anchor', 'end')
    .attr('x', width2 - 40)
    .attr('y', height2 + 65)
    .attr('font-size', '16')
    .attr('dy', '.35em')
    .text('Subscribers (in mn)')
}

$(document).on('click', '#download', function (){
  var node = $('#canvas3')[0]
  domtoimage.toSvg(node)
    .then(function (dataUrl) {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'youtube_channel.svg'
      a.click()
    })
    .catch(function (error) {
      console.error('oops, something went wrong!', error)
    })
})

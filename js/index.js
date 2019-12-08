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
      console.log(data)
      var months = _.map(data, 'Month')
      var channels = _.map(data, 'Channels')
      var colors = ['#66c2a5', '#D2691E', '#DAA520', '#8da0cb', '#a6d854', '#e78ac3']
      console.log(channels)
    })
    .fail(function (error) {
      alert(error)
    })
})

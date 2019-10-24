/* eslint-disable space-before-blocks */
$(window).on('load', function () { $('.loader-wrapper').fadeOut('slow') })

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
      console.log(width)
      console.log(height)
    })
    .fail(function (error) {
      alert(error)
    })
})

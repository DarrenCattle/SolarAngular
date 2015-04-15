//angular wrapper from codeschool, not sure if necessary
(function(){

	//initial app instantiation
	var app = angular.module('solarApp', ['angularCharts']);

	//math functions necessary for calcController
	function sind(num) {return Math.sin(num/180*Math.PI);};
	function cosd(num) {return Math.cos(num/180*Math.PI);};
	function tand(num) {return Math.tan(num/180*Math.PI);};
	function asind(num) {return 180*Math.asin(num)/Math.PI;};
	function acosd(num) {return 180*Math.acos(num)/Math.PI;};

	//display object array
	//format: {index: 0, time:'00:00', azimuth: 40, zenith: 60}
	var tabledata = [];
	var convert = [];

	//main array controller with calculate and update functions for graph and table
	app.controller('solarController', function() {

		//angular charts configuration
		this.config = {
		    title: 'Azimuth vs. Hour of Day',
		    tooltips: true,
		    labels: false,
		    mouseover: function() {},
		    mouseout: function() {},
		    click: function() {},
		    legend: {
		      display: true,
		      //could be 'left, right'
		      position: 'right'
		    },
		    lineLegend: 'traditional'
		};
		//push new information through the controller
		this.update = function () {
			this.minutes = tabledata;
			this.dat = {
				series: ['Azimuth', 'Zenith'],
		    	data: convert
			};
		};
		//calculate solar angles using empirical formulae
		this.calculate = function (latitude, day) {
			//reset array if they are full
			tabledata=[];
			convert=[];
			//define variables for solar calculation
			var B = (day-1)*360/365.242;
			var E = 229.18*(0.000075+0.001868*cosd(B)-0.032077*sind(B)-0.014615*cosd(2*B)-0.040849*sind(2*B));
			var decl = 23.45*sind(360*(284+day)/365.242);
			//loop for every minute in the selected day
			for(var b = 0; b<24; b++) {
				for(var c = 0; c<60; c++) {
				        var hourangle = 0.25*(b*60+c-720);
				        var czenith = cosd(latitude)*cosd(decl)*cosd(hourangle)+sind(latitude)*sind(decl);
				        var zenit = acosd(czenith);
				        var cazimuth = -(sind(latitude)*czenith-sind(decl))/(cosd(latitude)*sind(zenit));
				        var azimut = 180-acosd(cazimuth);
				        var wew = acosd(tand(decl)/tand(latitude));
				        var C1 = C2 = C3 = -1;
				        var C1 = Math.abs(hourangle)<= wew ? 1 : -1;
				        var C2 = latitude-decl>=0 ? 1 : -1;
				        var C3 = hourangle>=0 ? 1 : -1;

				        var prime = asind(sind(hourangle)*cosd(decl)/sind(zenit));
				        var ys=C1*C2*prime+C3*(1-C1*C2)*90;

				        var d = b*60+c;
				        var tim = Math.floor(d/60) < 10 ? "0" + Math.floor(d/60) : Math.floor(d/60);
	            		var tim1 = d%60 < 10 ? "0" + d%60 : d%60;

	            		//push to array using format specified above
				        tabledata.push({
				        	index: d,
				        	time: tim + ':' + tim1,
				        	azimuth: ys+180,
				        	zenith: 90-zenit
				        }); 
				}//loop c, angular-charts can't handle 1440 points so do an hourly chart
				convert.push({
		        	x: b,
		        	y: [ys+180,90-zenit]
		        });	
			}//loop b
			this.update();
		};//calculate
	});

})();
	
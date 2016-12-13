'use strict'

function Clouds(params){
	this.scale = {
		width: 0.15,
		height: 0.15
	};
	this.time = params.time;
	this.clouds = [];

	for(var i = 0; i < params.topicfiles.length; i++){
		let cloud = new Cloud({
			filename: params.topicfiles[i],
			size: this._getSize()
		});
		this.clouds.push(cloud);
	}

	for(var i = 0; i < this.clouds.length; i++)
		this.clouds[i].setOffset(this._getOffset(i));
}

Clouds.prototype.draw = function(){
	for(var cloud of this.clouds)
		cloud.draw();
};

Clouds.prototype._getSize = function(){
	var size = getSize('main');

	return {
		width: size.width * this.scale.width,
		height: size.height * this.scale.height
	};
}

Clouds.prototype._getOffset = function(i){
	var size = getSize('main');

	return {
		x: size.width/(this.clouds.length+1) * (i+1),
		y: size.height/this.time.size * (Number(this.time.index)+0.5)
	};
}

/*
 * filename,
 * size: { width, height },
 * offset: { x, y }
 */
function Cloud(params){
	this.filename = params.filename;
	this.size = params.size;
	this.offset = null;
}

Cloud.prototype.setSize = function(size){
	this.size = size;
}

Cloud.prototype.setOffset = function(offset){
	this.offset = offset;
}

Cloud.prototype.draw = function(){
	var cloud = this;
	return new Promise(function(resolve){
		d3.csv(cloud.filename, function(err, csvData){
			if(err) throw err;

			var max = d3.max(csvData, function(d){ return d.value });
			var sizeScale = d3.scaleLinear().domain([0, max]).range([10, 20]);
			var colorScale = d3.schemeCategory10;

			var words = csvData.map(function(d){
				return {
					text: d.word,
			    		size: sizeScale(d.value)
				};
			});

			d3.layout.cloud()
				.size([cloud.size.width, cloud.size.height])
				.words(words)
				.rotate(function(){ return Math.round(1 - d3.randomIrwinHall(2)()) * 90; })
				.font('Impact')
				.fontSize(function(d){ return d.size; })
				.on('end', function(words){
					d3.select('#wc')
					.append('g')
					.attr('transform', `translate(${cloud.offset.x}, ${cloud.offset.y})`)
					.selectAll('text')
					.data(words)
					.enter()
					.append('text')
					.style('font-size', function(d){ return d.size + 'px'; })
					.style('font-family', 'Impact')
					.style('fill', function(d, i){ return colorScale[i]; })
					.attr('text-anchor', 'middle')
					.attr('transform', function(d){
						return `translate(${[d.x, d.y]})rotate(${d.rotate})`;
					})
					.text(function(d){ return d.text });
				})
				.start();

			resolve();
		});
	});
}

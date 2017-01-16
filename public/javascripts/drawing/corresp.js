'use strict'

function drawCorresp(params){
	var e1 = `V${params.components[1]}`, e2 = `V${params.components[2]}`;

	var size = getSize(currentTab);
	var absMax;
	var xScale, yScale;
	
	d3.select('#corresp')
		.append('g')
		.attr('id', 'labels')
		.attr('transform', `translate(${size.width/2}, ${size.height/2})`);

	d3.csv(params.rowData, function(err, csvData){
		drawPoints(csvData, 'word');

		d3.csv(params.colData, function(err, csvData){
			drawPoints(csvData, 'person');
		});
	});

	function drawPoints(csvData, type){
		var svg = d3.select('#corresp');

		if(type === 'word'){	
			absMax = {
				e1: d3.max(csvData, function(d){ return Math.abs(d[e1]); }),
				e2: d3.max(csvData, function(d){ return Math.abs(d[e2]); })
			};
			
			xScale = d3.scaleLinear()
				.domain([-absMax.e1*1.1, absMax.e1*1.1])
				.range([-size.width*0.45, size.width*0.45]);
			yScale = d3.scaleLinear()
				.domain([-absMax.e2*1.1, absMax.e2*1.1])
				.range([size.height*0.45, -size.height*0.45]);
		}

		var label = {};
	
		var coordinate = [];
		for(var data of csvData){
			let c = [data[e1], data[e2]].toString();
	
			let index = coordinate.indexOf(c);
			if(coordinate.indexOf(c) < 0){
				label[coordinate.length] = {
					word: [ type === 'word' ? data.word : data.person ],
					coordinate: [ xScale(data[e1]), yScale(data[e2]) ]
				};
				coordinate.push(c);
			}else
				label[index].word.push(type === 'word' ? data.word : data.person);
		}

		var graphs = [];
	
		var keys = Object.keys(label);
		for(var key of keys){
			let g = {
				nodes: [{
					id: `.${key}`,
					fx: label[key].coordinate[0],
					fy: label[key].coordinate[1]
				}],
				links: [],
				coordinate: label[key].coordinate
			};
			for(var word of label[key].word){
				g.nodes.push({ id: word });
				g.links.push({ source: word, target: `.${key}` });
			}
			graphs.push(g);
		}

		if(type === 'word'){
			svg.append('g')
				.attr('class', 'axis')
				.attr('transform', `translate(${size.width*0.5}, ${size.height*0.5})`)
				.call(d3.axisBottom(xScale));
		
			svg.append('g')
				.attr('class', 'axis')
				.attr('transform', `translate(${size.width*0.5}, ${size.height*0.5})`)
				.call(d3.axisLeft(yScale));
		}
	
		var color = d3.scaleOrdinal(d3.schemeCategory10);

		svg.append('g')
			.selectAll('circle')
			.data(csvData)
			.enter()
			.append('circle')
			.attr('r', 3)
			.attr('fill', function(d){ return type === 'word' ? '#EF7598' : '#000000'; })
			.attr('cx', function(d){ return xScale(d[e1]); })
			.attr('cy', function(d){ return yScale(d[e2]); })
			.attr('transform', `translate(${size.width*0.5}, ${size.height*0.5})`);

		if(type === 'person'){
			svg.append('g')
				.attr('id', 'circle')
				.selectAll('circle')
				.data(csvData)
				.enter()
				.append('circle')
				.attr('r', 100)
				.attr('fill', 'none')
				.attr('stroke', '#000000')
				.attr('stroke-width', 1)
				.attr('cx', function(d){ return xScale(d[e1]); })
				.attr('cy', function(d){ return yScale(d[e2]); })
				.attr('transform', `translate(${size.width*0.5}, ${size.height*0.5})`);
		}
	
		for(var graph of graphs)
			drawLabels(graph, type);
	}

	function drawLabels(graph, type){
		var manyBody = d3.forceManyBody().strength(function(){ return -50; });

		var simulation = d3.forceSimulation()
			.force('link', d3.forceLink().id(function(d){ return d.id; }))
			.force('charge', manyBody)
			.force('center', d3.forceCenter(graph.coordinate[0], graph.coordinate[1]));

		var svg = d3.select('#labels')
			.append('g')
			.attr('class', 'label');
		
		var link = svg.append('g')
			.attr('class', 'links')
			.selectAll('line')
			.data(graph.links)
			.enter()
			.append('line')

		var node = svg.append('g')
			.attr('class', 'nodes')
			.selectAll('text')
			.data(graph.nodes)
			.enter()
			.append('text')
			.attr('font-size', function(d){ return type === 'word' ? 12 : 20; })
			.text(function(d){ return /^\./.test(d.id) ? '' : d.id; });
	
		simulation
			.nodes(graph.nodes)
			.on('end', function(){
				link
					.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });

				node
					.attr('x', function(d) { return d.x; })
					.attr('y', function(d) { return d.y; });
			});
	
		simulation
			.force('link')
			.links(graph.links);
	}
}

function changeRadius(params){
	var form = document.forms.radius.radius;

	var circles = document.getElementById('circle');

	for(var circle of circles.children)
		circle.setAttribute('r', form.value);
}

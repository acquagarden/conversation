var exec = require('child_process').exec;
console.log('hello node');

exec('R --vanilla --slave < test.R', function(err, stdout, stderr){
	console.log(stdout);
});

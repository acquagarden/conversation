var exec = require('child_process').exec;

exec('R --vanilla --slave < test.R', function(err, stdout, stderr){
	console.log(stdout);
});

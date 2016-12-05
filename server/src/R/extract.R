#args[1] inputname, args[2] outputname
args <- commandArgs(trailingOnly = T)

d <- read.csv(args[1], header=F)

for(i in seq(1, ncol(d), 2)){
	e <- d[1:10, i:(i+1)]
	colnames(e) = c('word', 'value')
	write.csv(e, paste(args[2], ceiling(i/2), '.csv', sep=''), row.names=F)
}

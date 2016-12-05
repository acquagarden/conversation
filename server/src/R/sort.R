#args[1] inputName, args[2] outputName, args[3] divnumber
args <- commandArgs(trailingOnly=T)

d <- read.csv(args[1], header=T, row.names=1)

rownames <- rownames(d)
d <- d[,1:args[3]]
m <- NULL

if(args[3] == 1){
	sortlist <- order(d, decreasing=T)
	m <- cbind(m, rownames[sortlist], d[sortlist])
	
}else{
	for(i in 1:args[3]){
		sortlist <- order(d[,i], decreasing=T)
		m <- cbind(m, rownames[sortlist], d[sortlist,i])
	}
}

write.table(m, args[2], quote=F, sep=',', row.names=F, col.names=F)

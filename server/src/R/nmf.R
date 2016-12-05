#args[1] inputName, args[2] outputName of w, args[3] outputName of h, args[4] divnumber, args[5] clusterNumber
args <- commandArgs(trailingOnly=T)

library(NMF)
d <- read.csv(args[1], header=T, row.names=1)
rownames <- rownames(d)
colnames <- colnames(d)[1:args[4]]
d <- d[,1:args[4]]
d <- as.matrix(d)
d.nmf <- nmf(d, as.numeric(args[5]), seed=1000)
w <- round(basis(d.nmf), digits=10)
h <- round(coef(d.nmf), digits=10)

label <- NULL
for(i in 1:args[5])
	label <- c(label, paste('topic', i, sep=''))

rownames(w) <- rownames
colnames(w) <- label
rownames(h) <- label
colnames(h) <- colnames

write.csv(w, args[2], quote=F, row.names=T)
write.csv(h, args[3], quote=F, row.names=T)

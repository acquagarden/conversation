args <- commandArgs(trailingOnly=T)

d <- read.csv(args[1], header=T, row.names=1)
label <- NULL
for(i in 1:ncol(d))
	label <- cbind(label, paste('time', i, sep=''))
colnames(d) <- label

s <- NULL
for(i in 1:ncol(d))
	s <- c(s, sum(d[,i]))
tf <- t(t(d)/s)
tf <- log(tf*as.numeric(args[3])+1)/log(as.numeric(args[3])+1)

func <- function(x) log10(ncol(d)/x)+1

idf <- NULL
for(i in 1:nrow(d))
	idf <- c(idf, c(func(sum(d[i,] > 0))))

tfidf <- tf
for(i in 1:nrow(d))
	for(j in 1:ncol(d))
		tfidf[i,j] <- tf[i,j]*idf[i]	

tfidf <- cbind(tfidf, tf, idf)
write.csv(tfidf, args[2], row.names=T)

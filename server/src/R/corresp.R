args <- commandArgs(trailingOnly=T)

library(MASS)
d <- read.csv(args[1], header=T, row.names=1)
d.ca <- corresp(d, nf=ncol(d))

d.rs <- d.ca$rscore
d.rs.hc <- hclust(dist(cbind(d.rs[,as.numeric(args[6])], d.rs[,as.numeric(args[7])])), method='ward.D')
cluster <- cutree(d.rs.hc, args[5])
d.rs <- cbind(rownames(d.rs), d.rs, cluster)
colnames(d.rs) <- paste(c('word', rep('V', ncol(d)), 'cluster'), c('', 1:ncol(d), ''), sep='')

egn <- d.ca$cor^2
ratio <- round(100*egn/sum(egn), 1)

v <- NULL
v <- cbind(v, egn)
v <- cbind(v, ratio)

d.cs <- cbind(rownames(d.ca$cscore), d.ca$cscore)
colnames(d.cs) <- paste(c('person', rep('V', ncol(d))), c('', 1:ncol(d)), sep='')

write.csv(v, args[2], row.names=T)
write.csv(d.rs, args[3], row.names=F)
write.csv(d.cs, args[4], row.names=F)

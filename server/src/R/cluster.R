args <- commandArgs(trailingOnly=T)

d <- read.csv(args[1], header=T, row.names=1)
d.hc <- hclust(dist(d), method='ward.D')
cluster <- cutree(d.hc, args[3])
d <- cbind(d, cluster)
write.csv(d, args[2], row.names=T)

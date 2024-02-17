import vidMake
import time

vidMake.init()
time.sleep(5.0)
for i in range(60):
	vidMake.addFrame(i)
	time.sleep(0.02)
vidMake.finish()
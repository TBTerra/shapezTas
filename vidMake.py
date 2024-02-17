from PIL import ImageGrab
import numpy as np
import cv2
import os

fourcc = 0
out = []

def init():
	global fourcc,out
	fourcc = cv2.VideoWriter_fourcc(*'mp4v')
	out = cv2.VideoWriter('output.mp4',fourcc, 60.0, (1920,1080))
	return
def addFrame(i):
	img = ImageGrab.grab()
	##img.save('frames/{:06d}.png'.format(i))#at 60fps, 6 digits will last 4 and a bit hours
	img_np = np.array(img)
	out.write(cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR))
def makeAudio(audio):
	with open('sounds.txt','wt') as f:
		for a in audio:
			f.write('{}\t{}\n'.format(a[0],a[1]))
	print(os.popen('sounds').read())
	print('audio done')

def finish():
	out.release()
	print(os.popen('ffmpeg -i output.mp4 -i out.wav -map 0:v -map 1:a -c:v copy combined.mp4').read())
	print('video done and merged')
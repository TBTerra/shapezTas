import keyboard
import mouse
import time
import sys
import math
import vidMake

##action ids
#0 mouse move x,y (includes 1 frame wait)
#1 press and release x key
#2 key x down
#3 key x up
#4 click x at y,z (includes 1 frame wait)
#5 mouse x down
#6 mouse x up
#7 wait x frames
#8 wait until x tick
#9 next level, with button at x,y
#10 upgrade thing x (1-4)
#11 wait for user input

preDelay=0.025
postDelay=0.025
#usualy 0.025-0.028
#increase to 0.035 if desyncing. or further

actions = []

camPX = [0,0]
tick = 0
record=False

lastSleep = 0;

def absCeil(a):
	return math.ceil(abs(a))
def clamp(val,minv,maxv):
	return max(min(val,maxv),minv)
def myCeil(a):##special implementation of math.ceil that rounds away from 0 rather than always up
	if a>0:
		return math.ceil(a)
	else:
		return -math.ceil(-a)

def smartSleep(sec):
	global lastSleep
	stop = lastSleep+sec
	while lastSleep<=stop:
		time.sleep(0)
		lastSleep = time.time()
def nextFrame():
	global tick
	smartSleep(preDelay)
	##insert frame capture here
	if record:
		vidMake.addFrame(tick)
	keyboard.press_and_release('n')
	tick +=1
	smartSleep(postDelay)
def fastnextFrame():#only for use in long gaps where nothing was happening anyway
	global tick
	smartSleep(preDelay)
	keyboard.press_and_release('n')
	tick +=1

def map2screen(x,y):
	pX = (x*12500)/419
	pY = (y*12500)/419
	a = int(pX-camPX[0])+1124
	b = int(pY-camPX[1])+495
	if a<0 or a>1920 or b<0 or b>1080:
		print(f'!!!!mouse move out of bounds!!!! {a},{b}  {x},{y}')
	return (a,b)
def calculateMove(x,y):
	pX = ((x+5)*12500)/419
	pY = ((y-2)*12500)/419
	return [int(pX-camPX[0]),int(pY-camPX[1])]
def waitforUser():
	global lastSleep
	keyboard.wait(']',suppress=True)#start trigger
	lastSleep = time.time()

def calcAudio(startF=0):
	audio = []
	simF=startF
	sel=''
	mouseD = ''
	for action in actions:
		if action[0] == 1:#select new hand object?
			if action[1]=='1' or action[1]=='2' or action[1]=='3' or action[1]=='4' or action[1]=='5' or action[1]=='6' or action[1]=='7' or action[1]=='8' or action[1]=='9' or action[1]=='0':
				audio.append((simF,'select'))
				if sel==action[1]:
					sel=''
				else:
					sel=action[1]
		elif action[0] == 0:#mouse move
			simF+=1
			if mouseD=='left' and sel:#mosue is down with something selected
				if sel=='1':
					audio.append((simF-0.2,'beltPlace'))
				else:
					audio.append((simF-0.2,'place'))
			elif mouseD=='right':
				audio.append((simF,'del'))
		elif action[0] == 4:#click
			simF+=1
			if action[1] == 'left':
				if sel=='1':
					audio.append((simF,'beltPlace'))
				else:
					audio.append((simF,'place'))
			else:
				audio.append((simF,'del'))
		elif action[0] == 5:#mouse down
			mouseD=action[1]
			if sel and action[1] == 'left':
				if sel=='1':
					audio.append((simF,'beltPlace'))
				else:
					audio.append((simF,'place'))
			elif action[1] == 'right':
				audio.append((simF,'del'))
		elif action[0] == 6:#mouse up
			mouseD=''
		elif action[0]==7:
			simF += action[1]
		elif action[0]==8:
			if(action[1]>simF):
				simF = action[1]
		elif action[0] == 9:#lv up
			audio.append((simF,'lvup'))
			simF+=1
		elif action[0] == 10:#upgrade
			audio.append((simF,'upgrade'))
			simF+=1
		elif action[0]==12:
			simF += abs(action[1])
	if record:
		vidMake.makeAudio(audio)

def actionInfo(startF=0):
	#0,4,9,10 are actions that take 1 frame
	#7 takes x frames (assumed to be required so counts as doing)
	#8 takes an unknown number of frames
	simF = startF
	framesDoing = startF
	for action in actions:
		if (action[0]==0) or (action[0]==4) or (action[0]==9) or (action[0]==10):
			framesDoing += 1
			simF +=1
		elif (action[0]==7):
			framesDoing += action[1]
			simF += action[1]
		elif (action[0]==8):
			print(f'{action[1]-simF},',end='')
			if(action[1]>simF):
				simF = action[1]
	print(f'\ntotal of {len(actions)} actions, taking {simF} frames (of which {framesDoing} are actualy spent doing something)')

def ready():
	global lastSleep
	if record:
		vidMake.init()
	lastSleep = time.time()

def play():
	for action in actions:
		if action[0]==0:
			mouse.move(action[1],action[2], absolute=True)
			nextFrame()
		elif action[0]==1:
			keyboard.press_and_release(action[1])
		elif action[0]==2:
			keyboard.press(action[1])
		elif action[0]==3:
			keyboard.release(action[1])
		elif action[0]==4:
			mouse.move(action[2], action[3], absolute=True)
			nextFrame()
			mouse.click(action[1])
		elif action[0]==5:
			mouse.press(action[1])
		elif action[0]==6:
			mouse.release(action[1])
		elif action[0]==7:
			for i in range(action[1]):
				nextFrame()
		elif action[0]==8:
			val = action[1]-tick
			print(f'sleeping for {val} frames: {action[2]}')
			if val>10 and  not record:
				nextFrame()
				for i in range(val-2):
					fastnextFrame()
				nextFrame()
			else:
				for i in range(val):
					nextFrame()
		elif action[0]==9:
			mouse.move(action[1],action[2], absolute=True)
			smartSleep(1.0)
			nextFrame()#note: the n will be ignored this is just to do frame capture, we add the n back in later
			mouse.click('left')
			smartSleep(1.0)
			if len(action)>4:
				mouse.move(action[3], action[4], absolute=True)
				smartSleep(postDelay)
				mouse.click('left')
			keyboard.press_and_release('n')
			smartSleep(postDelay)
			
		elif action[0]==10:
			keyboard.press_and_release('f')
			mouse.move(1278,173+(action[1]*164), absolute=True)
			smartSleep(1.0)
			nextFrame()#note: the n will be ignored this is just to do frame capture, we add the n back in later
			mouse.click('left')
			for i in range(2,len(action),2):
				mouse.move(action[i],action[i+1], absolute=True)
				smartSleep(preDelay+postDelay)
				mouse.click('left')
			##waitforUser()
			keyboard.press_and_release('f')
			smartSleep(preDelay+0.3)
			keyboard.press_and_release('n')
			smartSleep(postDelay)
		elif action[0]==11:
			waitforUser()
		elif action[0]==12:
			count = abs(action[1])
			dir = 1
			if action[1]<0:
				dir = -1
			for i in range(count):#zoom all the way in
				mouse.wheel(delta=dir)
				nextFrame()
	if record:
		vidMake.finish()
	return
def compile(text):
	global actions,camPX
	lines = text.splitlines()
	for i,line in enumerate(lines):
		if not line:#if line empty
			continue
		if line[0]=='#':
			continue
		parts = line.split()
		if(parts[0]=='wait'):
			actions.append((7,int(parts[1])))
		elif(parts[0]=='key'):
			actions.append((1,parts[1]))
		elif(parts[0]=='keyD'):
			actions.append((2,parts[1]))
		elif(parts[0]=='keyU'):
			actions.append((3,parts[1]))
		elif(parts[0]=='click'):
			pos = map2screen(int(parts[1]),int(parts[2]))
			actions.append((4,'left',pos[0],pos[1]))	
		elif(parts[0]=='rclick'):
			pos = map2screen(int(parts[1]),int(parts[2]))
			actions.append((4,'right',pos[0],pos[1]))
		elif(parts[0]=='line'):
			pos = map2screen(int(parts[1]),int(parts[2]))
			actions.append((0,pos[0],pos[1]))
			actions.append((5,'left'))
			for i in range(3,len(parts),2):
				pos = map2screen(int(parts[i]),int(parts[i+1]))
				actions.append((0,pos[0],pos[1]))
			actions.append((6,'left'))
		elif(parts[0]=='camera'):
			##move tech needs further work (but that would break existing input lists)
			needed = calculateMove(int(parts[1]),int(parts[2]))
			#print(f'needs a move of {needed[0]},{needed[1]}',end='')
			#work out the min number of moves
			moves = max(absCeil(needed[0]/1655),absCeil(needed[1]/985))
			#print(f', will do in {moves} moves')
			for i in range(moves):
				move = [clamp(needed[0],-1655,1655),clamp(needed[1],-985,985)]
				start = [1675,985]
				#work out move
				if move[0]<0:
					start[0]=20
				if move[1]<0:
					start[1]=0
				if move[0]>1575:#testing for special case
					if move[1]>=554 and move[1]<=744:
						start[1]=780
					if move[1]<=-241 and move[1]>=-431:
						start[1]=200
				if move[0]<0 and move[0]>=-100:
					start[0]=100
				actions.append((0,start[0],start[1]))#move to start
				actions.append((5,'left'))#left mouse down
				actions.append((0,start[0]-move[0],start[1]-move[1]))#move to end
				actions.append((7,3))#wait
				actions.append((6,'left'))#left mouse up
				needed[0] -= move[0]
				needed[1] -= move[1]
				camPX[0]+=move[0]
				camPX[1]+=move[1]
			#max move in a basic free square is 1655 in x, and 985 in y
			#this was assumed but not actually true, there's a dead zone over the pinned shapes, so extra checks have to ajust for that
		elif(parts[0]=='level'):
			if len(parts) > 3:
				actions.append((9,int(parts[1]),int(parts[2]),int(parts[3]),int(parts[4])))#parts 3+4 are x,y, of a place to click after the ui is gone
			else:
				actions.append((9,int(parts[1]),int(parts[2])))#x,y are position of next level button
			
		elif(parts[0]=='upgrade'):
			a=[10,int(parts[1])]#x is which upgrade, 1=belts,2=extraction,3=cutting,4=painting
			for i in range(2,len(parts),2):
				a.append(int(parts[i]))
				a.append(int(parts[i+1]))
			actions.append(tuple(a))
		elif(parts[0]=='until'):
			if len(parts)>2:
				actions.append((8,int(parts[1]),' '.join(parts[2:])))
			else:
				actions.append((8,int(parts[1]),' '))
		elif(parts[0]=='exit'):
			return#stop compiling commands past this point
		elif(parts[0]=='pause'):
			actions.append((11,0))
		elif(parts[0]=='zoom'):
			actions.append((12,int(parts[1])))
	return
def compileFile(name):
	with open(name,'r') as f:
		compile(f.read())
	return

if __name__ == "__main__":
	for arg in sys.argv:
		compileFile(arg)
	keyboard.wait(']',suppress=True)#start trigger
	play();
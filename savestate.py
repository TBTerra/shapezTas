import keyboard
import player

player.compileFile('inputs/savestate.txt')
keyboard.wait(']',suppress=True)#start trigger
player.tick=5000
player.ready()
player.play()
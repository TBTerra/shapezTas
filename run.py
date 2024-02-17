import keyboard
import mouse
import player

player.record = False
player.compileFile('inputs/bp%/lv1inputs.txt')
player.compileFile('inputs/bp%/lv2inputs.txt')
player.compileFile('inputs/bp%/lv4inputs.txt')
player.compileFile('inputs/bp%/lv5inputs.txt')
player.compileFile('inputs/bp%/lv6inputs.txt')
player.compileFile('inputs/bp%/lv7inputs.txt')
player.compileFile('inputs/bp%/lv8inputs.txt')
player.compileFile('inputs/bp%/lv9inputs.txt')
player.compileFile('inputs/bp%/lv10inputs.txt')
player.compileFile('inputs/bp%/lv11inputs.txt')
player.actionInfo(0)
player.calcAudio(0)
keyboard.wait(']',suppress=True)#start trigger
player.ready()
player.play()
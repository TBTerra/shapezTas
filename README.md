# ShapezTas
Set of tools/mods for the Tool assisted speedrunning of Shapez

This is a collection of tools/mods for TASing shapez, its far form perfect, but it did allow for a 4:37.85 run of BP%, saving nearly 90 seconds from the previous non frame advance based TAS

mods contain 3 mods  
1. TBTimer is an ingame timer with auto splits for level ups as well as obtaining upgrades
2. tas-tools is used when tassing as it gives hotkeys to pause the game while still in control, and to advance the game by a single update
3. betterSave is used to make factories load in the same state they were saved in (only works with new saves)

as this tas tool uses frame advance, it cannot be recorded by normal recording software, instead it is recorded frame by frame, and the audio is reconstructed to sound like it would if the game was running at 60fps

to use this you will need to compile sounds.cpp to sounds.exe (TAS does not need this, but recording system will)

Ive also included the input data fro the BP% run

The code is a mess, and the input sintax is clunky, for a longer run, i will be re-writing most of this
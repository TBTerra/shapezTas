const METADATA = {
    website: "https://github.com/TBTerra/ShapezTas",
    author: "TBTerra",
    name: "TBtimer",
    version: "1",
    id: "TBtimer",
    description: "adds a ingame timer for speed-running with in game time",
	doesNotAffectSavegame: true,
};

function TimeFormat(t){
	var t2 = t.toFixed(2)
	var sec = ("00"+ (t2%60).toFixed(2)).slice(-5);
	var min = ("00"+ Math.floor((t2/60)%60)).slice(-2);
	var hour = Math.floor(t2/3600);
	if(hour>0){
		return hour + ":" + min + ":" + sec;
	}else{
		return min + ":" + sec;
	}
}
var timeEle = {};
var splitEle = {};
var lastLv = 1;
var lastBelt = 0;
var lastExtract = 0;
var lastCut = 0;
var lastPaint=0;
var splits = [];

const GameHUDExt = ({ $old }) => ({//triggered every frame?
	shouldPauseGame() {
		var TN = TimeFormat(this.root.time.now())
		timeEle.innerText = TN;
		if(this.root.hubGoals.level != lastLv){
			if(this.root.hubGoals.level == 1){
				splits = [];
				splitEle.innerText = "Auto-split enabled";
				lastBelt = lastExtract = lastCut = lastPaint = 0;
			}else{
				var newLine = "Level " + (this.root.hubGoals.level-1) + " in " + TN;
				splits.push(newLine);
				splits = splits.slice(-10);
				splitEle.innerText = splits.join("\n");
			}
		}
		if(this.root.hubGoals.upgradeLevels.belt != lastBelt){
			var newLine = "Belt " + (this.root.hubGoals.upgradeLevels.belt+1) + " in " + TN;
			splits.push(newLine);
			splits = splits.slice(-10);
			splitEle.innerText = splits.join("\n");
		}
		if(this.root.hubGoals.upgradeLevels.miner != lastExtract){
			var newLine = "Extract " + (this.root.hubGoals.upgradeLevels.miner+1) + " in " + TN;
			splits.push(newLine);
			splits = splits.slice(-10);
			splitEle.innerText = splits.join("\n");
		}
		if(this.root.hubGoals.upgradeLevels.processors != lastCut){
			var newLine = "Cutter " + (this.root.hubGoals.upgradeLevels.processors+1) + " in " + TN;
			splits.push(newLine);
			splits = splits.slice(-10);
			splitEle.innerText = splits.join("\n");
		}
		if(this.root.hubGoals.upgradeLevels.painting != lastPaint){
			var newLine = "Paint " + (this.root.hubGoals.upgradeLevels.painting+1) + " in " + TN;
			splits.push(newLine);
			splits = splits.slice(-10);
			splitEle.innerText = splits.join("\n");
		}
		lastLv = this.root.hubGoals.level;
		lastBelt = this.root.hubGoals.upgradeLevels.belt;
		lastExtract = this.root.hubGoals.upgradeLevels.miner;
		lastCut = this.root.hubGoals.upgradeLevels.processors;
		lastPaint = this.root.hubGoals.upgradeLevels.painting;
		return $old.shouldPauseGame.call(this);
	}
});

class Mod extends shapez.Mod {
	init(){
		this.signals.stateEntered.add(state => {
            if (state.key === "InGameState") {
                const element = document.createElement("div");
                element.id = "ingame_HUD_TBtimer";
                document.body.appendChild(element);
				
				const aSplits = document.createElement("div");
				aSplits.id = "SplitsTimes";
				aSplits.innerText = "Auto-split enabled";
				
				const timerE = document.createElement("div");
				timerE.id = "IngameTimer";
				timerE.innerText = "0";
				
				element.appendChild(aSplits);
				element.appendChild(timerE);
				timeEle = timerE;
				splitEle = aSplits;
			}
		});
		this.modInterface.registerCss(`
			#ingame_HUD_TBtimer {
				position: absolute;
				bottom: calc(10px * var(--ui-scale));
				left: calc(10px * var(--ui-scale));
				border-radius: calc(4px * var(--ui-scale));
				background: #0008;
				z-index: 256;
			}
			#IngameTimer{
				display: block;
				font-family: Monaco;
				font-size: calc(20px * var(--ui-scale));
				color: #DDD;
				float: right;
				margin: calc(5px * var(--ui-scale)) calc(5px * var(--ui-scale));
			}
			#SplitsTimes{
				display: block;
				font-family: Monaco;
				font-size: calc(10px * var(--ui-scale));
				color: #DDD;
				text-align: right;
				margin: calc(5px * var(--ui-scale)) calc(5px * var(--ui-scale)) 0px;
				line-height: 100%;
			}
		`);
		this.modInterface.extendClass(shapez.GameHUD, GameHUDExt);
	}
}
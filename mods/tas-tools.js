const METADATA = {
    website: "https://github.com/TBTerra/ShapezTas",
    author: "TBTerra",
    name: "TAS tools",
    version: "1",
    id: "TAStool",
    description: "Mod for helping with TASing, tick advance on N, selectable seed, and game starts paused",
	doesNotAffectSavegame: true,
	settings: {},
};

//note: as the set seed part of this code directly overwrites source code, changes to source need to be monitored

var gamePaused = true,setSeed=0;

const GameHUDExt = ({ $old }) => ({//triggered every frame?
	shouldPauseGame() {
		//console.log(this.root.time.realtimeNow());
		return $old.shouldPauseGame.call(this) || gamePaused;
	},
});

const GameCoreExt = ({ $old }) => ({
	initializeRoot(...args) {
		$old.initializeRoot.call(this, ...args);
		this.root.keyMapper.getBinding(shapez.KEYMAPPINGS.mods["tick"]).add(this.nextTick, this);
	},
	nextTick(){
		const root = this.root;
		gamePaused = false;
		root.time.updateRealtimeNow();
		root.time.performTicks(this.root.dynamicTickrate.deltaMs, this.boundInternalTick);
		root.productionAnalytics.update();
		root.achievementProxy.update();
		gamePaused = true;
		return shapez.STOP_PROPAGATION;
	},
});

class Mod extends shapez.Mod {
	togglePause() {
		gamePaused = !gamePaused;
	}
    init() {
		this.modInterface.registerIngameKeybinding({
			id: "pause",
			keyCode: 19,
			translation: "Pause",
			handler: this.togglePause
		}),
		this.modInterface.registerIngameKeybinding({
			id:"tick",
			keyCode:shapez.keyToKeyCode("N"),
			translation: "Next tick",
		});
		this.modInterface.extendClass(shapez.GameHUD, GameHUDExt);
		this.modInterface.extendClass(shapez.GameCore, GameCoreExt);
		this.modInterface.extendClass(shapez.GameTime, ({ $old }) => ({
			realtimeNow() {
				return this.timeSeconds;
			}
		}));
		this.modInterface.replaceMethod(shapez.MainMenuState, "onPlayButtonClicked", (function() {
			const a = new shapez.FormElementInput({
				id: "setSeed",
				placeholder: "1",
				defaultValue: "1",
				validator: a => Number.parseInt(a) >= 0 && Number.parseInt(a) <= 2147483647 || "" == a
			}),
			n = new shapez.DialogWithForm({
				app: this.app,
				title: "Seed",
				desc: "Set the custom seed (0-2147483647)",
				formElements: [a],
				buttons: ["cancel:bad", "ok:good"],
				closeButton: false
			});
			this.dialogs.internalShowDialog(n), n.buttonSignals.ok.add((() => {
				if (a.getValue()!=""){
					setSeed = Number.parseInt(a.getValue());
				}else{
					setSeed = 0;
				}
				const savegame = this.app.savegameMgr.createNewSavegame();
				this.moveToState("InGameState", {savegame,});
			}));
		}));
		this.modInterface.replaceMethod(shapez.GameCore, "initNewGame", (function() {
			this.root.gameIsFresh = true;
			this.root.map.seed = setSeed;
			if(!this.root.gameMode.hasHub()){
				return;
			}
			const hub = shapez.gMetaBuildingRegistry.findByClass(shapez.MetaHubBuilding).createEntity({
				 root: this.root,origin: new shapez.Vector(-2, -2),rotation: 0,originalRotation: 0,rotationVariant: 0,variant: shapez.defaultBuildingVariant,
			});
			this.root.map.placeStaticEntity(hub);
			this.root.entityMgr.registerEntity(hub);
			this.root.camera.center = new shapez.Vector(-5, 2).multiplyScalar(shapez.globalConfig.tileSize);
		}));
	}
}
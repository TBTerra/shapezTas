const METADATA = {
	website: "https://github.com/TBTerra/ShapezTas",
	author: "TBTerra",
	name: "betterSave",
	version: "1",
	id: "betterSave",
	description: "makes buildings remember what was in them in saves",
	doesNotAffectSavegame: false,
};

class Mod extends shapez.Mod {
	init(){
		//overwrite the save schema for itemProcessor
		this.modInterface.extendObject(shapez.ItemProcessorComponent, ({$super, $old}) => ({
			getSchema(){
				return {
					nextOutputSlot: shapez.types.uint,
					inputSlots: new TypeMap(
						shapez.types.nullable(shapez.typeItemSingleton)
					),
					inputCount: shapez.types.int,
					ongoingCharges: shapez.types.array(
						shapez.types.structured({
							items: shapez.types.array(
								shapez.types.structured({
									item: shapez.types.nullable(shapez.typeItemSingleton),
									requiredSlot: shapez.types.nullable(shapez.types.int),
								})
							),
							remainingTime: shapez.types.float,
						}),
					),
					bonusTime: shapez.types.float,
					queuedEjects: shapez.types.array(
						shapez.types.structured({
							item: shapez.types.nullable(shapez.typeItemSingleton),
							requiredSlot: shapez.types.nullable(shapez.types.int),
						})
					),
				};
			}
		}));
		//itemAcceptor dosnt seem to contain anything
		
		//hacky fix for the way parts of the game would advance by one tick on load but time would not advance
		this.modInterface.replaceMethod(shapez.InGameState , "stage5FirstUpdate", function () {
			if (this.switchStage(shapez.GAME_LOADING_STATES.s5_firstUpdate)) {
				this.stage6PostLoadHook();
			}
		});

		// Fix by alextd:
		// Trash replaces its ItemProcessor's tryTakeItem function in addAchievementReceiver()
		// which SOMEHOW ends up setting inputSlots to itself
		// -- that is, it processes the trash building entity itself, not the input shape.
		//
		// This would fail to save as it creates infinite recursion saving inputSlots:
		// entity => component => entity, etc.
		//
		// It seems some bogus internal JavaScript function binding nonsense confused the programmer here
		// The replacement function calls the original like so: tryTakeItem(...arguments)
		// But this actually passes along the arguments of addAchievementReceiver(), 
		// NOT the arguments of the () => {} replacement function!
		// That is to say: entity is passed in where tryTakeItem expects an item.
		// (And tryTakeItem luckily doesn't even use the second argument for trash buildings which would be empty)
		// And this does mean the item trashed is forgotten about in code...
		// Ironically that's the purpose of the trash building so it seems to work fine and no one noticed!
		// So yes, Trash buildings have always been trashing themselves,
		// It just didn't matter until you try to save it...
		// 
		// Anyway that's all bullshit so let's remove the function replacement entirely.
		// All it does is track an achievement.
		// Who cares about this one stupid achievement.
		this.modInterface.replaceMethod(shapez.MetaTrashBuilding, "addAchievementReceiver", function() {})
	}
}

//thankyou to foxwhateverthehellthatnameis for this, even if i had to rewrite quite a bit, i didnt even know it was posible till you showed me
class TypeMap extends shapez.BaseDataType {

	constructor(valueType) {
		super();
		this.valueType = valueType;
	}

	serialize(value) {
		//console.log("serialize");
		let result = {};
		//console.log(value);
		for (const ele of value) {
			const serialized = this.valueType.serialize(ele[1]);
			result[ele[0]] = serialized;
		}
		return result;
	}
	deserialize(value, targetObject, targetKey, root) {
		//console.log("deserialize");
		let result = new Map();
		let proxy = {}
		for (const key in value) {
			const errorCode = this.valueType.deserializeWithVerify(value[key], proxy, key, root);
			if (errorCode) {
				return errorCode;
			}
			result.set(parseInt(key),proxy[key])
		}
		//console.log(result);
		targetObject[targetKey] = result;
	}

	getAsJsonSchemaUncached() {
		return {
			type: "object",
			additionalProperties: this.valueType.getAsJsonSchema(),
		};
	}

	verifySerializedValue(value) {if (typeof value !== "object") {return "!obj";}
	}

	getCacheKey() {
		return "map." + this.valueType.getCacheKey();
	}
}

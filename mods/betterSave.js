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
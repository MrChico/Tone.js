import { Param } from "../context/Param";
import { UnitMap, UnitName } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";

interface GainOptions<TypeName extends UnitName> extends ToneAudioNodeOptions {
	gain: UnitMap[TypeName];
	units: TypeName;
	convert: boolean;
	minValue?: number;
	maxValue?: number;
}

/**
 * A thin wrapper around the Native Web Audio GainNode.
 * The GainNode is a basic building block of the Web Audio
 * API and is useful for routing audio and adjusting gains.
 * @category Core
 * @offline 0.7 1
 * @example
 * const gainNode = new Tone.Gain(0).toDestination();
 * const osc = new Tone.Oscillator().connect(gainNode);
 * gainNode.gain.rampTo(1, 0.1);
 * gainNode.gain.rampTo(0, 0.4, 0.2);
 */
export class Gain<TypeName extends "gain" | "decibels" | "normalRange" = "gain"> extends ToneAudioNode<GainOptions<TypeName>> {

	readonly name: string = "Gain";

	/**
	 * The gain parameter of the gain node.
	 * @example
	 * const gainNode = new Tone.Gain(0).toDestination();
	 * const osc = new Tone.Oscillator().connect(gainNode);
	 * gainNode.gain.rampTo(1, 0.1);
	 * gainNode.gain.rampTo(0, 2, "+0.5");
	 */
	readonly gain: Param<TypeName>;

	/**
	 * The wrapped GainNode.
	 */
	private _gainNode: GainNode = this.context.createGain();

	// input = output
	readonly input: GainNode = this._gainNode;
	readonly output: GainNode = this._gainNode;

	/**
	 * @param  gain The initial gain of the GainNode
	 * @param units The units of the gain parameter.
	 */
	constructor(gain?: UnitMap[TypeName], units?: TypeName);
	constructor(options?: Partial<GainOptions<TypeName>>);
	constructor() {
		super(optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]));
		const options = optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]);

		this.gain = new Param({
			context: this.context,
			convert: options.convert,
			param: this._gainNode.gain,
			units: options.units,
			value: options.gain,
			minValue: options.minValue,
			maxValue: options.maxValue,
		});
		readOnly(this, "gain");
	}

	static getDefaults(): GainOptions<any> {
		return Object.assign(ToneAudioNode.getDefaults(), {
			convert: true,
			gain: 1,
			units: "gain",
		});
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._gainNode.disconnect();
		this.gain.dispose();
		return this;
	}
}

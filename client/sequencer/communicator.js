//communicator class to create and manage a shared buffer between the sequencer
//and the audio engine
import {RingBuffer} from "../utils/ringbuf-alt.js";
import { PubSub } from '../messaging/pubSub.js';

class Communicator {
	constructor() {
		if (Communicator.instance) {
			return Communicator.instance; // Singleton pattern
	}
		Communicator.instance = this;
		this.messaging = new PubSub();
	}

	send(signal, channel){
		//console.log("SENDING SIGNAL", signal, channel);
		//send a dictionary of signal and channel
		this.messaging.publish("sequencerTrigger", {signal:signal, channel:channel});
	}

	reset(channel){
		//console.log("RESETTING");
		this.messaging.publish("sequencerTrigger", {signal:0, channel:channel});
	}

}

export {Communicator};

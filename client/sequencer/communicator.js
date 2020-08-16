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

	send(signal=1, channel){
		console.log("SENDING SIGNAL");
		this.messaging.publish("sequencerTrigger", signal);
	}

	reset(){
		//console.log("RESETTING");
		this.messaging.publish("sequencerTrigger", 0);
	}

}

export {Communicator};

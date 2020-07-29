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

	send(){
		console.log("SENDING SIGNAL");
		this.messaging.publish("sequencerTrigger", 0); //0 sent first
		this.messaging.publish("sequencerTrigger", 1);
		//this.messaging.publish("sequencerTrigger", 0);
	}

}

export {Communicator};

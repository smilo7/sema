//communicator class to create and manage a shared buffer between the sequencer
//and the audio engine
import {RingBuffer} from "../utils/ringbuf-alt.js";
import { PubSub } from '../messaging/pubSub.js';
let messaging = new PubSub();


class Communicator {
	constructor() {
		if (Communicator.instance) {
			return Communicator.instance; // Singleton pattern
	}
		Communicator.instance = this;
	}

	createSAB(chID, ttype, blocksize, port) {
	  let sab = RingBuffer.getStorageForCapacity(32 * blocksize, Float64Array);
	  let ringbuf = new RingBuffer(sab, Float64Array);

	  port.postMessage({
	    func: 'sab',
	    value: sab,
	    ttype: ttype,
	    channelID: chID,
	    blocksize:blocksize
	  });
	  this.sabs[chID] = {sab:sab, rb:ringbuf};
	  console.log(this.sabs);
	}



}

export {Communicator};

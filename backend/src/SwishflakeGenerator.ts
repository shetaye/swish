// Inspired by https://github.com/twitter/snowflake/tree/snowflake-2010
export class SwishflakeGenerator {
  EPOCH_BITS = 42;
  NODE_BITS = 10;
  NONCE_BITS = 12;
  EPOCH = 1577836800000; // First millisecond of 2020

  maxNode = Math.pow(2, this.NODE_BITS);
  maxNonce = Math.pow(2, this.NONCE_BITS);

  nonce: number = 0;
  node: number;
  lastTimestamp: number;

  constructor(nodeID: number) {
    if (nodeID < 0 || nodeID > this.maxNode) {
      // FIXME: Error handling
      this.node = 0;
      return;
    }
    this.node = nodeID;
  }

  nextID(): string {
    let currentTimestamp = this.timestamp();
    if (currentTimestamp < this.lastTimestamp) {
      return null;
    }
    if (currentTimestamp == this.lastTimestamp) {
      // Increment the nonce
      this.nonce++;
      if (this.nonce > this.maxNonce) {
        // Ran out of IDs in this ID space, must block until the next millisecond
        // FIXME: Probably could be better than this
        while (currentTimestamp == this.lastTimestamp) {
          currentTimestamp = this.timestamp();
        }
      }
    } else {
      // Reset the nonce to begin counting from 0 again
      this.nonce = 0;
    }
    this.lastTimestamp = currentTimestamp;
    // FIXME: This can be better
    return BigInt(
      `0b${currentTimestamp
        .toString(2)
        .padStart(this.EPOCH_BITS, '0')}${this.node
        .toString(2)
        .padStart(this.NODE_BITS, '0')}${this.nonce
        .toString(2)
        .padStart(this.NONCE_BITS, '0')}`,
    ).toString();
  }

  timestamp(): number {
    return new Date().getTime() - this.EPOCH;
  }
}